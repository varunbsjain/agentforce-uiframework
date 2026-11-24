import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderToStaticMarkup } from 'react-dom/server';
import {describe,it,expect} from 'vitest';

const render=(source:string)=>renderToStaticMarkup(
  React.createElement(ReactMarkdown,{remarkPlugins:[remarkGfm],children:source})
);

describe('Agentforce Markdown conversation fallback',()=>{
  it('renders pricing tables as readable table markup',()=>{
    const html=render('| Item | Cost |\n|---|---|\n| Device | $45.84/mo |');
    expect(html).toContain('<table>');
    expect(html).toContain('$45.84/mo');
  });
  it('renders Salesforce relative record links',()=>{
    const html=render('[Quote](/lightning/r/Quote/0Q0sample/view)');
    expect(html).toContain('href="/lightning/r/Quote/0Q0sample/view"');
  });
  it('does not execute embedded HTML or javascript URLs',()=>{
    const html=render('<script>alert(1)</script>\n\n[Bad](javascript:alert(1))');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
  });
  it('retains structured lists and emphasis',()=>{
    const html=render('1. **New Mobility Customer**\n2. Existing Mobility Customer');
    expect(html).toContain('<ol>');
    expect(html).toContain('<strong>');
  });
});
