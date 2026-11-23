# Salesforce deployment status and prerequisites

**Status: NOT YET INSTALLABLE AS A COMPLETE SALESFORCE APPLICATION.** This repository has a working schema-driven React foundation and a Node LLM-composition reference, but no verified Salesforce org deployment or live Agentforce gateway.

## Prerequisites

- A Salesforce org with supported Multi-Framework React UIBundle hosting and App Domain enabled.
- A supported, activated Agentforce agent. The Agent API excludes the Agentforce (Default) agent type.
- Current Salesforce CLI and the Salesforce `reactinternalapp` template.
- Appropriate permission sets and runtime access.
- Server-side credentials and approved access to an LLM for UI composition.

## Salesforce installation path

1. Generate a **new official Salesforce React internal application project** using the current CLI's `reactinternalapp` template. This creates the UIBundle and CustomApplication metadata in the supported format.
2. Bring the `src/` React code and required dependencies into the generated React project.
3. Preserve official template-generated build configuration, metadata and entrypoint.
4. Set `VITE_AGENT_MODE=salesforce` when building and provide a real Apex REST integration at `/services/apexrest/agentui/v1/chat`.
5. Deploy using `sf project deploy start --source-dir force-app` in the generated DX project and assign the generated app permission set.
6. Verify the deployed app and Agentforce integration using a real authorized user.

## Current integration limitations

- `src/agent/salesforce.ts` adds an intended Salesforce Data SDK transport, **but its API shape has not been compiled against a real Salesforce platform SDK installation**.
- The Apex REST gateway is not implemented.
- The Node `server/` implementation demonstrates response composition only, not the Salesforce Agent API connection.
- No working one-click org installation can be asserted.

Do not configure the bare Vite root app as a UIBundle; use official Salesforce scaffolding first.

## References

- https://developer.salesforce.com/docs/platform/multiframework/guide/mfw-quick-start.html
- https://developer.salesforce.com/docs/platform/multiframework/guide/mfw-deploy.html
- https://developer.salesforce.com/docs/platform/multiframework/guide/data-sdk-intro.html
- https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-get-started.html
