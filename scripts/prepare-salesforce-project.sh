#!/usr/bin/env bash
# Generate a Salesforce-supported React UIBundle and copy the framework + Apex metadata.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$ROOT/salesforce-output}"
ORG="${2:-}"
command -v sf >/dev/null || { echo "Install Salesforce CLI first" >&2; exit 1; }
command -v npm >/dev/null || { echo "Install Node/npm first" >&2; exit 1; }
if [[ -e "$DEST" ]]; then echo "Output exists: $DEST" >&2; exit 1; fi
mkdir -p "$DEST"
sf template generate project --name AgentforceUI --template reactinternalapp --output-dir "$DEST"
PROJECT="$DEST/AgentforceUI"
if [[ ! -f "$PROJECT/sfdx-project.json" ]]; then echo "Generated project not found" >&2; exit 1; fi
BUNDLE="$(find "$PROJECT/force-app/main/default/uiBundles" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "$BUNDLE" ]]; then echo "No UIBundle from Salesforce template" >&2; exit 1; fi
cp -R "$ROOT/src/." "$BUNDLE/src/"
cp "$ROOT/index.html" "$BUNDLE/index.html"
cp "$ROOT/src/styles.css" "$BUNDLE/src/styles.css"
# Keep platform-sdk version and Vite configuration from official Salesforce scaffold.
node - "$ROOT/package.json" "$BUNDLE/package.json" <<'NODE'
const fs=require('fs');
const [source,destination]=process.argv.slice(2);
const external=JSON.parse(fs.readFileSync(source,'utf8'));
const internal=JSON.parse(fs.readFileSync(destination,'utf8'));
for(const key of ['dependencies','devDependencies']){
  internal[key]??={};
  for(const [name,version] of Object.entries(external[key]??{})){
    if(name.startsWith('@salesforce/platform-sdk')) continue;
    internal[key][name]=version;
  }
}
internal.scripts={...internal.scripts,typecheck:'tsc --noEmit',test:'vitest run'};
fs.writeFileSync(destination,JSON.stringify(internal,null,2)+'\n');
NODE
for dir in classes objects customMetadata customPermissions permissionsets; do
  if [[ -d "$ROOT/force-app/main/default/$dir" ]]; then
    mkdir -p "$PROJECT/force-app/main/default/$dir"
    cp -R "$ROOT/force-app/main/default/$dir/." "$PROJECT/force-app/main/default/$dir/"
  fi
done
echo "Generated Salesforce DX project: $PROJECT"
echo "UIBundle: $BUNDLE"
echo "Next: cd '$BUNDLE' && npm install && npm run build"
echo "Then: cd '$PROJECT' && sf project deploy start --source-dir force-app ${ORG:+--target-org $ORG}"
echo "Set AgentUI_Config__mdt.Default.Agent_API_Name__c and assign AgentUI_User permission set."
echo "Composer requires named credential AgentUI_Composer; disabled by default."
