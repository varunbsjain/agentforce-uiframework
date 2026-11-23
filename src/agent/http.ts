import type { AgentAdapter, AgentResult } from '../types';
import { validateSpec } from '../engine/schema';
export function createHttpAgentAdapter(endpoint:string):AgentAdapter {
  if(!endpoint.startsWith('/')||endpoint.startsWith('//')) throw new Error('Endpoint must be same-origin');
  return {async send(input):Promise<AgentResult>{
    const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:input.sessionId,message:input.message,interaction:input.interaction,history:input.history}),signal:input.signal});
    if(!response.ok) throw new Error('Agent request failed ('+response.status+')');
    const result=await response.json() as AgentResult;
    if(!result||typeof result.sessionId!=='string'||!result.message||result.message.role!=='assistant') throw new Error('Invalid agent response');
    if(result.message.ui) validateSpec(result.message.ui);
    return result;
  }};
}
