import { create } from 'zustand';
import type { ChatMessage } from '../types';
type State={messages:ChatMessage[];sessionId:string;busy:boolean;error:string|null;values:Record<string,unknown>;append:(m:ChatMessage)=>void;setSession:(id:string)=>void;setBusy:(v:boolean)=>void;setError:(v:string|null)=>void;setValue:(id:string,v:unknown)=>void;reset:()=>void};
export const useChat=create<State>(set=>({messages:[],sessionId:crypto.randomUUID(),busy:false,error:null,values:{},append:m=>set(s=>({messages:[...s.messages,m]})),setSession:sessionId=>set({sessionId}),setBusy:busy=>set({busy}),setError:error=>set({error}),setValue:(id,v)=>set(s=>({values:{...s.values,[id]:v}})),reset:()=>set({messages:[],sessionId:crypto.randomUUID(),busy:false,error:null,values:{}})}));
