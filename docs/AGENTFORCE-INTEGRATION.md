# Agentforce integration contract

The frontend intentionally **does not** call Salesforce Agent API directly. The adapter calls a same-origin authenticated backend endpoint to prevent exposing OAuth secrets and to enforce authorization. The backend must manage Agentforce sessions, access tokens, request payloads, message polling/streaming and error handling according to the Salesforce Agent API version enabled in the target org.

## Browser to backend

POST `/api/agent/chat` with JSON:

```json
{"sessionId":"uuid","message":"Find accounts","history":[]}
```

Or for an interaction:

```json
{"sessionId":"uuid","interaction":{"sessionId":"uuid","turnId":"turn","componentId":"account","action":{"type":"AGENT_TURN","name":"reviewOrder","collect":["account"]},"values":{"account":"001..."}},"history":[]}
```

The response must be:

```json
{"sessionId":"uuid","message":{"id":"turn-id","role":"assistant","timestamp":1,"text":"Select an account","ui":{"version":"1.0","type":"ui","root":{"type":"Text","props":{"text":"Hello"}}}}}
```

## Backend obligations

1. Authenticate the Salesforce user and authorize the selected agent and every requested business action.
2. Resolve credentials server-side using a supported Salesforce authentication mechanism; never expose a client secret or privileged access token to the browser.
3. Maintain mapping between local session IDs and actual Agentforce sessions. Handle expiration and cleanup.
4. Normalize text/structured action responses into the UI schema. If using a UI-composer LLM, validate its output before returning it.
5. Execute action names only from an explicit allowlist, with CRUD/FLS/sharing checks performed by the Salesforce execution layer.
6. Bound request sizes, apply rate limits and CSRF protection, validate an origin and use HTTPS.
7. Return actionable error states without exposing sensitive data.

The contract is an integration boundary, not a claim that a production Agentforce endpoint is already installed. Implementations should be validated against the target org's current Agent API documentation and agent capabilities.

## Salesforce references

- https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api.html
- https://developer.salesforce.com/docs/platform/multiframework/guide/multiframework-overview.html
