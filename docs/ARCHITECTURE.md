# Architecture

User → React chat → Agent adapter → authenticated application backend → Agentforce session API → response normalizer → validated UI schema → React registry renderer.

The framework distinguishes **data**, **UI composition**, and **side effects**. The model may choose a permitted component and configure its props but cannot return executable JavaScript, JSX, CSS or Salesforce action commands. The renderer rejects unregistered components and bounds nesting. The action dispatcher sends identifiers and state values to an authorized backend for business execution.

## Modules

- `src/types.ts`: wire contracts.
- `src/engine/schema.ts`: schema validation and complexity limits.
- `src/engine/bindings.ts`: read-only data reference resolver (no JavaScript evaluation).
- `src/ui/registry.tsx`: 26 implemented reusable components.
- `src/engine/renderer.tsx`: safe recursive composition.
- `src/state/useChat.ts`: conversation and form state.
- `src/agent/mock.ts`: runnable local demo with illustrative data.
- `src/agent/http.ts`: authenticated same-origin agent adapter interface.

## Current limitations

No real Agentforce backend, Salesforce metadata-aware record service, UIBundle org deployment validation, server-driven event streaming or 100-component enterprise catalog is claimed. These are documented follow-on work and require a Salesforce org for verification. The current UI renderer uses complete JSON responses, not incremental partial-node streaming.
