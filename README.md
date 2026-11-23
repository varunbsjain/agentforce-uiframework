# Agentforce Generative UI Framework

An OpenUI-inspired, schema-driven React chat framework designed for integration with Salesforce Agentforce and eventual Salesforce `UIBundle` deployment.

**Status: working React foundation / mock demo. Not yet a Salesforce-deployed production system.**

## Implemented

- Responsive React chat experience with Salesforce-inspired styling.
- 26 registered layout, input, data-display, workflow and chart components.
- JSON UI specification, Ajv schema validation and complexity limits.
- Declarative read-only data binding and safe component mapping.
- Multi-turn interaction event envelope, form state and session lifecycle in the browser.
- Mock agent demonstrating account selection, pipeline dashboard and case form.
- Same-origin HTTP adapter for an authenticated Agentforce integration backend.
- Unit tests for UI protocol safety and data bindings.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Open the Vite development URL. This uses **fictional example data** by default and performs no Salesforce operations.

## Connect to Agentforce

Set `VITE_AGENT_ENDPOINT=/api/agent/chat` in a local `.env` file and implement the server-side endpoint defined in [Agentforce integration contract](docs/AGENTFORCE-INTEGRATION.md). The backend must authenticate users, broker Agentforce session APIs, validate actions and enforce Salesforce permissions. The frontend does **not** directly hold Agent API credentials.

## Salesforce UIBundle

Do not assume a plain Vite distribution is deployable UIBundle source. Generate a supported Salesforce React internal-app UIBundle using the current Salesforce CLI for the target org, move the React source into the generated project, and preserve its template-managed manifest/metadata/build configuration. The included source is UI-framework code, not an org-validated `UIBundle` metadata package.

## Next milestones

1. Implement and test the Salesforce Agent API backend in a connected development org.
2. Scaffold Salesforce UIBundle metadata with the official React internal-app template and validate deployment.
3. Add Salesforce platform data integration, CRUD/FLS-aware record components and metadata services.
4. Add authenticated event streaming, response normalization and deterministic component discovery.
5. Expand beyond the initial 26 components toward the proposed 100-component catalog, with schema/interaction tests and a playground.
6. Harden with CI, integration tests, accessibility testing, audit telemetry and production deployment validation.

See [architecture](docs/ARCHITECTURE.md) and [coding-agent instructions](AGENTS.md).
