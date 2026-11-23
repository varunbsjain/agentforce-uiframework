import React from 'react';
import type { ComponentProps, UINode, UISpec } from '../types';
import { registry } from '../ui/registry';
import { resolveValue } from './bindings';
import { validateSpec } from './schema';
export function NodeRenderer({node, context, depth=0}:{node:UINode;context:Omit<ComponentProps,'node'|'children'>;depth?:number}) {
  if(depth>12) return null;
  const Component=registry[node.type];
  if(!Component) return <div className="error">Unsupported component: {node.type}</div>;
  const data={...context.data};
  const props=Object.fromEntries(Object.entries(node.props??{}).map(([key,value])=>[key,resolveValue(value,data)]));
  return <Component {...context} node={{...node,props}}>{node.children?.map((child,i)=><NodeRenderer key={child.id??i} node={child} context={context} depth={depth+1}/>)}</Component>;
}
export function DynamicRenderer({spec, values, setValue, onAction}:{spec:UISpec;values:Record<string,unknown>;setValue:(id:string,value:unknown)=>void;onAction:(node:UINode)=>void}) {
  try {validateSpec(spec);} catch(error){return <div className="error" role="alert">{String(error)}</div>;}
  return <NodeRenderer node={spec.root} context={{data:spec.data??{},values,setValue,dispatch:onAction}}/>;
}
