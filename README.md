# Agentforce Generative UI Framework

A Salesforce Multi-Framework / React generative UI foundation. Uses the Salesforce Data SDK, an Apex REST gateway, Agentforce invocable actions and an **optional** LLM UI Composer. Built UI is declarative JSON rendered using a restricted React component registry.

**Current status: implementation committed, Salesforce org deployment NOT verified. This is not a one-click production installer.**

## Features committed
- Responsive React conversational interface, conversational state and interactive action envelope.
- 26 registered React components, schema validation and read-only data binding.
- Mock workflows for account selection, opportunity pipeline and case intake.
- Salesforce Data SDK transport (`VITE_AGENT_MODE=salesforce`).
- Apex REST gateway at `/services/apexrest/agentui/v1/chat`.
- Agentforce invocation via custom invocable action `generateAiAgentResponse`, version 1.0.0.
- Optional server-side OpenAI-compatible UI Composer using Salesforce Named Credential `AgentUI_Composer`.
- Permission set and Custom Metadata configuration for choosing an agent.
- Separate experimental Node-based component discovery/UI composer (for developer testing only).
- Automated frontend and composer tests in GitHub Actions.
- UIBundle preparation script based on Salesforce's **official** `reactinternalapp` template.

## Run demo locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

This uses fictional data and does not require Salesforce.

## Prepare the Salesforce UIBundle

```bash
# Requirements: current Salesforce CLI and authenticated supported Salesforce org
bash scripts/prepare-salesforce-project.sh

cd salesforce-output/AgentforceUI/force-app/main/default/uiBundles/<generated-bundle-name>
npm install
npm run build

# From the generated DX project root:
sf project deploy start --source-dir force-app --target-org <your-org-alias>
```

The script copies the React source and Apex metadata into the official Salesforce-generated project. Do not use the root Vite project as a Salesforce UIBundle directly.

After deployment, assign `AgentUI_User` and the app's access permission set. In Custom Metadata, set `AgentUI_Config.Default.Agent_API_Name__c` to an activated Agentforce agent. Enable the optional LLM Composer only after configuring the `AgentUI_Composer` Named Credential and reviewing your org's data policies.

**Installation cannot fully succeed without org-specific agent configuration and Salesforce capabilities.** See [configuration guide](docs/CONFIGURATION.md) and [deployment limitations](docs/SALESFORCE-DEPLOYMENT.md).

## Remaining work before production
- Validate compile/deployment and the generated UIBundle entrypoint in a real Salesforce sandbox.
- Verify native invocable action session behavior, limits and permissions on the target agent.
- Harden session ownership, authorization, audit, telemetry, rate limiting and security testing.
- Test LLM composer behavior with production-approved model and real response types.
- Expand the component catalog from 26 to 100 and add a development playground.
- Add E2E browser tests and Salesforce integration tests.

The [draft pull request](https://github.com/varunbsjain/agentforce-uiframework/pull/1) contains the work without merging unverified changes into main.
