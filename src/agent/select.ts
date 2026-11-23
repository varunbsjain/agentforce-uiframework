import type { AgentAdapter } from '../types';
import { mockAgent } from './mock';
import { createHttpAgentAdapter } from './http';
import { createSalesforceAdapter } from './salesforce';
/** Explicit transport selection; live failures never fall back to fictional records. */
export function selectAgentAdapter(): AgentAdapter {
  const mode=import.meta.env.VITE_AGENT_MODE as string|undefined;
  if(mode==='salesforce') return createSalesforceAdapter();
  if(mode==='http') {
    const endpoint=import.meta.env.VITE_AGENT_ENDPOINT as string|undefined;
    if(!endpoint) throw new Error('VITE_AGENT_ENDPOINT is required');
    return createHttpAgentAdapter(endpoint);
  }
  return mockAgent;
}
