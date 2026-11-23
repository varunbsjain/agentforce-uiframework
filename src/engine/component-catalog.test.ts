import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { registry } from '../ui/registry';
import { allowedComponents, validateSpec } from './schema';
import type { ComponentProps } from '../types';

const sampleProps: Record<string,unknown> = {
  label:'Sample',title:'Sample title',text:'Sample text',value:40,defaultValue:2,
  columns:[{key:'name',label:'Name'}],rows:[{name:'Acme'}],
  records:[{id:'001',name:'Acme',status:'Active'}],
  items:[{id:'1',label:'First',title:'First',name:'Acme',description:'Demo',value:20,price:10,amount:10}],
  products:[{id:'p1',name:'Plan',price:40}],
  options:[{label:'First',value:'first'}],steps:['First','Second'],
  points:[{x:1,y:2},{x:2,y:3}],groups:[{label:'First',values:[1,2]}],
  tabs:[{id:'a',label:'Tab A',content:'Welcome'}],totalPages:3
};
const context:Omit<ComponentProps,'node'|'children'>={
  data:{},values:{},setValue:()=>{},dispatch:()=>{}
};

describe('100 component implementation',()=>{
  it('registers 100 unique components, each permitted by the schema',()=>{
    const names=Object.keys(registry);
    expect(names).toHaveLength(100);
    expect(new Set(names).size).toBe(100);
    expect(new Set(names)).toEqual(allowedComponents);
  });
  it('renders every registered component without throwing in server-side smoke tests',()=>{
    for(const [name,Component] of Object.entries(registry)){
      const html=renderToStaticMarkup(React.createElement(Component,{
        ...context,node:{id:'test',type:name,props:sampleProps}
      },React.createElement('span',{},'Nested content')));
      expect(html.length,name).toBeGreaterThan(0);
    }
  });
  it('accepts all 100 component names and rejects unsupported ones',()=>{
    for(const name of Object.keys(registry)){
      expect(()=>validateSpec({version:'1.0',type:'ui',root:{type:name,props:sampleProps}}),name).not.toThrow();
    }
    expect(()=>validateSpec({version:'1.0',type:'ui',root:{type:'ArbitraryCode'}})).toThrow();
  });
  it('renders user text as escaped text instead of HTML',()=>{
    const C=registry.Text;
    const output=renderToStaticMarkup(React.createElement(C,{
      ...context,node:{type:'Text',props:{text:'<script>alert(1)</script>'}}
    }));
    expect(output).toContain('&lt;script&gt;');
    expect(output).not.toContain('<script>');
  });
  it('rejects unsafe links',()=>{
    const C=registry.LinkText;
    const html=renderToStaticMarkup(React.createElement(C,{
      ...context,node:{type:'LinkText',props:{href:'javascript:alert(1)',label:'Open'}}
    }));
    expect(html).not.toContain('href=');
  });
});
