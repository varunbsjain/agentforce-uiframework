#!/usr/bin/env bash
# Build a Salesforce-supported React UIBundle and deploy Apex/UI metadata to an authenticated org.
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "Usage: bash scripts/install-to-org.sh <salesforce-org-alias> [generated-output-directory]" >&2
  exit 2
fi
ORG="$1"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${2:-$ROOT/salesforce-output}"
command -v sf >/dev/null || { echo "Salesforce CLI not found; install and authenticate first." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm not found; install Node.js 22+" >&2; exit 1; }
echo "Checking Salesforce org $ORG ..."
sf org display --target-org "$ORG" --json >/dev/null
echo "Preparing Salesforce React/CustomApplication/UITBundle template ..."
bash "$ROOT/scripts/prepare-salesforce-project.sh" "$OUT" "$ORG"
PROJECT="$OUT/AgentforceUI"
BUNDLE="$(find "$PROJECT/force-app/main/default/uiBundles" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
[[ -n "$BUNDLE" ]] || { echo "Salesforce template did not create a UIBundle" >&2; exit 1; }
echo "Installing and building UIBundle at $BUNDLE"
(cd "$BUNDLE" && npm install --no-audit --no-fund && npm run build)
echo "Validating Salesforce metadata..."
(cd "$PROJECT" && sf project deploy validate --source-dir force-app --target-org "$ORG" --test-level RunSpecifiedTests --tests AgentUIComposerTest --tests AgentUIPresentationOrchestratorTest --tests AgentUIPresentationComposerTest)
echo "Deploying Salesforce metadata..."
(cd "$PROJECT" && sf project deploy start --source-dir force-app --target-org "$ORG" --test-level RunSpecifiedTests --tests AgentUIComposerTest)
echo "Assigning AgentUI_User permission set..."
sf org assign permset --name AgentUI_User --target-org "$ORG"
echo "The template-generated app permission set also needs assignment."
echo "Configure Custom Metadata AgentUI_Config > Default > Agent API Name with an activated Agentforce agent."
echo "Optional: configure named credential AgentUI_Composer and enable Composer Enabled."
echo "Open the new CustomApplication in Salesforce App Launcher."
