import { createDataSDK } from '@salesforce/platform-sdk/data';
import type { AgentAdapter, AgentResult } from '../types';
import { validateSpec } from '../engine/schema';
export function createSalesforceAdapter(): AgentAdapter {
  let sdkPromise: ReturnType<typeof createDataSDK> | undefined;
  return {async send(input): Promise<AgentResult> {
    sdkPromise ??= createDataSDK();
    const sdk = await sdkPromise;
    if (!sdk.fetch) throw new Error('Salesforce REST transport unavailable');
    const response = await sdk.fetch('/services/apexrest/agentui/v1/chat', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({sessionId:input.sessionId,message:input.message,interaction:input.interaction}),
      signal:input.signal
    });
    if(!response.ok) throw new Error('Salesforce gateway returned HTTP '+response.status);
    const result = await response.json() as AgentResult;
    if(!result?.message || result.message.role!=='assistant' || typeof result.sessionId!=='string') throw new Error('Invalid gateway response');
    if(result.message.ui) validateSpec(result.message.ui);
    return result;
  }};
}
