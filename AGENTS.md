# Instructions for coding agents

1. Keep business agents independent of React and UI layout.
2. Any new UI component must be registered, schema validated, documented and tested.
3. Never execute model-generated source code, HTML, event handlers, styles or dynamic imports.
4. Use an authenticated same-origin application backend for Agentforce; do not add secrets to Vite environment variables.
5. Check supported Salesforce UIBundle templates and metadata against the actual Salesforce CLI and target org before deploying.
6. Run `npm ci` (after committing a lockfile), `npm run typecheck`, `npm test`, `npm run build` and Salesforce org validation.
7. Mock fixtures must remain visibly labelled, never masquerade as live CRM data.
8. All transaction actions must validate allowed action identifiers, session ownership, CRUD/FLS/sharing and user permissions server-side.
9. Update implementation status in README after each completed milestone.
