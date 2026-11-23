export type Scalar = string | number | boolean | null;
export type UIAction = { type: 'AGENT_TURN' | 'LOCAL' | 'NAVIGATE'; name: string; collect?: string[]; payload?: Record<string, Scalar> };
export type UINode = { id?: string; type: string; props?: Record<string, unknown>; children?: UINode[]; action?: UIAction };
export type UISpec = { version: '1.0'; type: 'ui'; root: UINode; data?: Record<string, unknown> };
export type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system'; text?: string; ui?: UISpec; timestamp: number };
export type Interaction = { sessionId: string; turnId: string; componentId: string; action: UIAction; values: Record<string, unknown> };
export type AgentResult = { message: ChatMessage; sessionId: string };
export interface AgentAdapter { send(input: { sessionId: string; message?: string; interaction?: Interaction; history: ChatMessage[]; signal?: AbortSignal }): Promise<AgentResult> }
export type ComponentProps = { node: UINode; data: Record<string, unknown>; values: Record<string, unknown>; setValue: (id: string, value: unknown) => void; dispatch: (node: UINode) => void; children?: React.ReactNode };
