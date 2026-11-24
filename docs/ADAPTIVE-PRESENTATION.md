# Adaptive Presentation Orchestrator

The **Agentforce agent returns ordinary conversational text**. It does not supply component names or UI schemas. The presentation layer must decide if generating a UI adds value.

## Execution

1. The authenticated browser posts a user message to the Apex gateway.
2. Agentforce processes the turn and produces a text response.
3. `AgentUIPresentationOrchestrator.decide()` selects a presentation mode using a deterministic, conservative first-pass policy:
   - `conversation`: greetings, plain explanations, ambiguous questions, simple acknowledgments. No composer call.
   - `enhanced`: status summaries, cart tables, verifications and errors that benefit from read-only panels.
   - `interactive`: explicit choices and multi-field inputs. The LLM may compose select/input controls.
   - `defer`: reserved for future ambiguity and evidence checks. Falls back to original response.
4. If Composer is disabled, unavailable or returns an invalid schema, **return the original agent response without a generated UI**.
5. For eligible modes, the optional Apex `AgentUIComposer` calls the configured LLM through Named Credential `AgentUI_Composer`. Generated output is constrained to allowlisted components. The UI Composer is never authorized to mutate Salesforce data.
6. `AgentUIComposer.validate()` rejects unsupported types, excessive nesting, unintended action names and ungrounded option labels.
7. React renders the validated component tree, with **View original Agentforce response** available beneath it.
8. Interactive forms send `submitResponse` as an ordinary text message to Agentforce; any business action must be reasoned about and executed through Agentforce's authorized actions.

## Product behavior

| Agent text | Mode | UI treatment |
|---|---|---|
| "Hello! How can I help?" | conversation | Original text only |
| "I found some plans. Which one?" | conversation | Original text only; do not invent the plan list |
| "1. New Mobility Customer / 2. Existing Mobility Customer" | interactive | Select or choice cards, then submit a normal reply |
| "Provide Opportunity Name and Quote Name" | interactive | Two text inputs and submit |
| "Your credit check is approved" | enhanced | Optional status card |
| "Here are eight pricing options" | interactive | Option selection with all explicit values retained |
| "Duplicate agreement blocked eSign" | enhanced | Warning/recovery summary without invented remediation |
| "Proposal PDF ready" without URL | conversation | Preserve text; do not fabricate a download link |

## Response contract

The gateway returns `{sessionId,message:{id,role:'assistant',text,presentationMode,ui?,timestamp}}`.
`ui` is nullable. `text` is **always** the original Agentforce message.

## Quality and safety

- The first classifier is an intentionally conservative heuristic. It is *not* a calibrated semantic classifier, and some responses will be routed imperfectly. Future phases can add a lightweight LLM ambiguity classifier with evaluated thresholds.
- The composer enforces a small trusted presentation subset of the 100-component registry; a component count alone does not imply it is safe for every use case.
- Generated input options must be grounded in the agent response; options lacking source support are rejected.
- LLM-generated actions are restricted to `submitResponse`, which causes a normal user turn, never direct DML. The server rejects other action identifiers.
- Original text is accessible even if UI generation succeeds.
- No numeric confidence is fabricated. A later confidence system should be trained/calibrated using real labeled turns.
- No claim is made that the 32-turn sample trace has been fully regressed. Salesforce Apex deployment and real agent output require sandbox verification.
- The component composition is not cached in the initial implementation; add schema-versioned, privacy-safe template caching only after measuring repeated patterns.

## Validation

Run `bash scripts/install-to-org.sh <org-alias>` to deploy and execute Apex tests. Set the agent API name, optional `AgentUI_Composer` named credential and model access in your sandbox. Evaluate representative conversational, enhanced, interactive, failure and missing-data turns, recording mode selection, validation errors, fallback rate and latency.

For sensitive source data, redact customer identities, tax IDs, contact numbers and record identifiers before using traces as fixtures.
