import test from 'node:test';
import assert from 'node:assert/strict';
import {discover,verifyUI,textUI} from './composer.mjs';
test('discovers record components',()=>assert.ok(discover('Found 3 account records',{}).includes('RecordSelector')));
test('allows safe text display',()=>assert.equal(verifyUI(textUI('hello')).root.type,'Text'));
test('rejects code components',()=>assert.throws(()=>verifyUI({version:'1.0',type:'ui',root:{type:'Script'}})));
test('rejects unauthorized agent actions',()=>assert.throws(()=>verifyUI({version:'1.0',type:'ui',root:{type:'Button',action:{type:'AGENT_TURN',name:'deleteAccount'}}})));
test('permits allowlisted action',()=>assert.doesNotThrow(()=>verifyUI({version:'1.0',type:'ui',root:{type:'Button',action:{type:'AGENT_TURN',name:'selectAccount'}}},['selectAccount'])));
