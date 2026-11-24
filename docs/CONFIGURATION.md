# Org configuration guide

This is not a zero-configuration Salesforce package. A running Agentforce agent, user permissions and optional LLM credential are org-specific.

## Install
1. Install/update the Salesforce CLI and log into a Salesforce sandbox or development org.
2. Run `bash scripts/prepare-salesforce-project.sh` from this repository.
3. Open the generated UIBundle directory, run `npm install`, `npm run typecheck`, `npm test` and `npm run build`.
4. Deploy the generated DX project using `sf project deploy start --source-dir force-app --target-org <alias>`.
5. Assign permission set `AgentUI_User` plus the UIBundle app's generated access permission set.
6. In Salesforce Setup → Custom Metadata Types → Agent UI Configuration → Manage Records → Default, set `Agent_API_Name__c` to your activated agent's API name (the invocable action version currently uses 1.0.0).
7. Set `VITE_AGENT_MODE=salesforce` at build time. Without this setting the app uses fictional demo data.
8. Test the app from the Salesforce App Launcher with an authorized user.

## LLM UI Composer
To enable the second LLM, create a named credential with API name `AgentUI_Composer`, endpoint `https://api.openai.com/v1`, and a properly secured external credential that injects the provider authorization header. Configure the chosen model via `AgentUI_Config__mdt.Default.Composer_Model__c` and enable `Composer_Enabled__c`.

Do not expose model API keys in the React app, Apex source or Custom Metadata. Verify external model privacy and data-handling policies before sending CRM information.

When the composer is disabled or fails, the UI displays safe text from Agentforce. The generated UI is strictly restricted to presentation components and cannot authorize Salesforce actions.

## Security limitations
The current Apex gateway is a prototype. Before production use, enforce server-side ownership of Agentforce session IDs; add governance for allowed actions and record access; apply rate limiting, audit logging, error correlation and safe telemetry. Review the API action execution context. A local dev test is not proof of correct Salesforce permissions or deployment.

## Compatibility
- Requires an org that supports Salesforce Multi-Framework React internal apps.
- Agent invocation uses the Salesforce `generateAiAgentResponse` custom invocable action API (version 1.0.0). Check actual agent API name, permissions and output shape in the target org.
- The full set of 100 components, playground, streaming UI, and advanced Salesforce metadata rendering are future enhancements.


## Adaptive Presentation mode

The Apex gateway invokes `AgentUIPresentationOrchestrator` after the business agent produces ordinary text. The orchestrator bypasses the LLM for simple conversation; it invokes the optional composer for rich summaries and explicit input requests. See [ADAPTIVE-PRESENTATION.md](ADAPTIVE-PRESENTATION.md). The original response is always retained and inspectable. The composer only supports a safe subset of the 100 React components.
