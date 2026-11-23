import React from 'react';
import type { ComponentProps } from '../types';

type C = React.ComponentType<ComponentProps>;
const txt=(v:unknown)=>v==null?'':String(v);
const prop=(c:ComponentProps,k:string)=>c.node.props?.[k];
const number=(v:unknown,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const value=(c:ComponentProps)=>c.values[c.node.id??'']??prop(c,'defaultValue')??'';
const set=(c:ComponentProps,v:unknown)=>{if(c.node.id)c.setValue(c.node.id,v)};
const list=(v:unknown):Array<Record<string,unknown>>=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[];
const options=(v:unknown)=>Array.isArray(v)?v.map(x=>typeof x==='object'&&x!==null?{label:txt(x.label),value:txt(x.value)}:{label:txt(x),value:txt(x)}):[];
const Field=({c,children}:{c:ComponentProps;children:React.ReactNode})=><label className="field"><span>{txt(prop(c,'label'))}{prop(c,'required')?' *':''}</span>{children}</label>;
const input=(c:ComponentProps,type:string)=><Field c={c}><input aria-label={txt(prop(c,'label'))} type={type} value={txt(value(c))} onChange={e=>set(c,e.currentTarget.value)} placeholder={txt(prop(c,'placeholder'))} min={prop(c,'min')==null?undefined:txt(prop(c,'min'))} max={prop(c,'max')==null?undefined:txt(prop(c,'max'))} step={prop(c,'step')==null?undefined:txt(prop(c,'step'))} required={Boolean(prop(c,'required'))}/></Field>;

export const EmailInput:C=c=>input(c,'email');
export const PasswordInput:C=c=>input(c,'password');
export const PhoneInput:C=c=>input(c,'tel');
export const UrlInput:C=c=>input(c,'url');
export const NumberInput:C=c=>input(c,'number');
export const DateInput:C=c=>input(c,'date');
export const TimeInput:C=c=>input(c,'time');
export const DateTimeInput:C=c=>input(c,'datetime-local');
export const ColorInput:C=c=>input(c,'color');
export const RangeInput:C=c=><Field c={c}><input type="range" aria-label={txt(prop(c,'label'))} min={number(prop(c,'min'),0)} max={number(prop(c,'max'),100)} step={number(prop(c,'step'),1)} value={number(value(c),number(prop(c,'min'),0))} onChange={e=>set(c,number(e.currentTarget.value))}/><small>{txt(value(c))}</small></Field>;
export const Switch:C=c=><label className="aui-toggle"><input type="checkbox" role="switch" checked={Boolean(c.values[c.node.id??'']??prop(c,'defaultValue')??false)} onChange={e=>set(c,e.currentTarget.checked)}/><span>{txt(prop(c,'label'))}</span></label>;
export const MultiSelect:C=c=>{const items=options(prop(c,'options'));const selected=Array.isArray(value(c))?value(c) as string[]:[];return <fieldset className="aui-multiselect"><legend>{txt(prop(c,'label'))}</legend>{items.map(o=><label key={o.value}><input type="checkbox" checked={selected.includes(o.value)} onChange={e=>set(c,e.currentTarget.checked?[...selected,o.value]:selected.filter(s=>s!==o.value))}/>{o.label}</label>)}</fieldset>};
export const RatingInput:C=c=>{const max=Math.max(1,Math.min(10,number(prop(c,'max'),5)));const selected=number(value(c));return <fieldset className="aui-rating"><legend>{txt(prop(c,'label'))}</legend>{Array.from({length:max},(_,i)=><button key={i} type="button" aria-label={'Rate '+(i+1)} aria-pressed={selected===i+1} onClick={()=>set(c,i+1)}>{i<selected?'★':'☆'}</button>)}</fieldset>};
export const SearchBox:C=c=><Field c={c}><input type="search" aria-label={txt(prop(c,'label'))} value={txt(value(c))} onChange={e=>set(c,e.currentTarget.value)} placeholder={txt(prop(c,'placeholder')??'Search...')}/></Field>;
export const QuantityStepper:C=c=>{const min=number(prop(c,'min'),0),max=number(prop(c,'max'),999),n=number(value(c),number(prop(c,'defaultValue'),1));return <div className="aui-quantity"><span>{txt(prop(c,'label'))}</span><button type="button" disabled={n<=min} onClick={()=>set(c,Math.max(min,n-1))} aria-label="Decrease">−</button><output>{n}</output><button type="button" disabled={n>=max} onClick={()=>set(c,Math.min(max,n+1))} aria-label="Increase">+</button></div>};
export const SegmentedSelect:C=c=>{const opts=options(prop(c,'options'));return <div className="aui-segments" role="group" aria-label={txt(prop(c,'label'))}>{opts.map(o=><button type="button" key={o.value} aria-pressed={value(c)===o.value} onClick={()=>set(c,o.value)}>{o.label}</button>)}</div>};
export const FieldGroup:C=c=><fieldset className="aui-fieldgroup"><legend>{txt(prop(c,'label'))}</legend>{c.children}</fieldset>;
export const AddressForm:C=c=>{const current=(c.values[c.node.id??'']??{}) as Record<string,string>;const names=['street','city','state','postalCode','country'];return <fieldset className="aui-address"><legend>{txt(prop(c,'label')??'Address')}</legend>{names.map(n=><label className="field" key={n}><span>{n==='postalCode'?'Postal code':n[0].toUpperCase()+n.slice(1)}</span><input value={current[n]??''} onChange={e=>set(c,{...current,[n]:e.currentTarget.value})}/></label>)}</fieldset>};

export const formComponents:Record<string,C>={EmailInput,PasswordInput,PhoneInput,UrlInput,NumberInput,DateInput,TimeInput,DateTimeInput,ColorInput,RangeInput,Switch,MultiSelect,RatingInput,SearchBox,QuantityStepper,SegmentedSelect,FieldGroup,AddressForm};
