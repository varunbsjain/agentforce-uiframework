# Salesforce smoke-test checklist

## Installation and configuration
1. Run `bash scripts/install-to-org.sh <org-alias>` with a supported org.
2. Confirm the Salesforce CLI validation/deployment finishes without metadata errors. Capture any deployment ID and error text.
3. In Setup, open Custom Metadata Types → Agent UI Configuration → Manage Records → Default. Set the API name of an **activated** agent compatible with `generateAiAgentResponse`.
4. Assign `AgentUI_User` plus the app permission set from the generated Salesforce template.
5. Open the App Launcher and select the generated React application.
6. Verify the left sidebar says `Salesforce org mode`. A local/mock banner is evidence of incorrect build settings.
7. Send `Hello`. The response must originate from the configured agent. The app does **not** silently use fictional data in live mode.

## Conversation flow
8. Send a second message about the first answer; the agent should retain conversation context through its persisted server-side session ID.
9. Open a new conversation; it must start a different agent session.
10. Try a question returning record data; with Composer disabled, expect text from Agentforce.
11. Enable Composer only after configuring the `AgentUI_Composer` named credential and security. Try a list or comparison question; expect a validated table/card where suitable, otherwise text.
12. Revoke `AgentUI_User`, reload, and verify requests are blocked.

## Failure and troubleshooting
- **403**: permission set/custom permission or endpoint access missing.
- **503**: Custom Metadata Default missing an Agent API Name.
- **502**: agent invocation failed or is incompatible; verify active agent/API version and org permissions.
- **400**: invalid request or other gateway exception; check Apex debug logs.
- **Composer not rendering cards**: verify Named Credential and custom metadata enabled; fallback to text is intentional.
- **UIBundle build fails**: confirm official template version, Data SDK import and React tooling versions.
- **Missing App Launcher item**: check Salesforce App Domain, CustomApplication, UIBundle deployment and generated app permission set.
- **Uncommitted work pending**: the optional composer callout may conflict with Agentforce operations within a transaction. Disable it and use the text fallback while debugging transaction behavior.

## Current limitations
Apex test coverage does not exercise an actual agent. Salesforce org features and activated agent configuration cannot be inferred from the repository. Do not use customer data until security and permission behavior have been verified in your sandbox.
