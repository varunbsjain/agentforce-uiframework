import { createDataSDK } from '@salesforce/platform-sdk/data';
import type { AgentAdapter, AgentResult } from '../types';
import { validateSpec } from '../engine/schema';

/** Salesforce Multi-Framework authenticated transport. */
export function createSalesforceAdapter(): AgentAdapter {
  let sdkPromise: ReturnType<typeof createDataSDK> | undefined;
  let sessionOwner: string | undefined;
  let agentSessionId: string | undefined;
  return { async send(input): Promise<AgentResult> {
    // Reset the real Agentforce session when the user starts a new local chat.
    if (input.sessionId !== sessionOwner) {
      sessionOwner = input.sessionId;
      agentSessionId = undefined;
    }
    sdkPromise ??= createDataSDK();
    const sdk = await sdkPromise;
    if (!sdk.fetch) throw new Error('Salesforce REST transport unavailable');
    const response = await sdk.fetch('/services/apexrest/agentui/v1/chat', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:input.sessionId,
        agentSessionId,
        message:input.message,
        interaction:input.interaction
      }),
      signal:input.signal
    });
    if(!response.ok) {
      const body=await response.json().catch(()=>({error:'Unknown Salesforce error'})) as {error?:string};
      throw new Error(body.error??'Salesforce gateway returned HTTP '+response.status);
    }
    const result = await response.json() as AgentResult & {agentSessionId?: string};
    if(!result?.message || result.message.role!=='assistant' || typeof result.sessionId!=='string') throw new Error('Invalid gateway response');
    if(result.message.ui) validateSpec(result.message.ui);
    if (result.agentSessionId) agentSessionId = result.agentSessionId;
    return result;
  }};
}
