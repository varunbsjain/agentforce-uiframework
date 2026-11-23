import 'dotenv/config';
import express from 'express';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {composeUI,textUI} from './composer.mjs';
/** Reference integration server, NOT a public deployable production gateway. */
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'64kb'}));
function guard(req,res,next){
 const expected=process.env.GATEWAY_TEST_TOKEN;
 const candidate=req.get('x-gateway-test-token');
 if(!expected||!candidate)return res.status(401).json({error:'Authentication is required'});
 const a=Buffer.from(expected),b=Buffer.from(candidate);
 if(a.length!==b.length||!timingSafeEqual(a,b))return res.status(403).json({error:'Forbidden'});
 next();
}
app.get('/health',(_req,res)=>res.json({status:'ok',mode:'development-reference'}));
app.post('/api/agent/chat',guard,async(req,res)=>{
 try{
  const {sessionId,message,interaction}=req.body||{};
  if(typeof sessionId!=='string'||sessionId.length>128)return res.status(400).json({error:'Invalid session'});
  const content=interaction?JSON.stringify({name:interaction.action?.name,values:interaction.values}):message;
  if(typeof content!=='string'||!content.trim()||content.length>10000)return res.status(400).json({error:'Invalid message'});
  // This service only supports explicit integration testing. Salesforce Agent API invocation is not yet configured.
  const text='Agentforce connection is not configured. Your message was not sent. Configure a verified agent backend before enabling live mode.';
  const ui=process.env.UI_COMPOSER_API_KEY?await composeUI({text,structured:null}):textUI(text);
  res.json({sessionId,message:{id:randomUUID(),role:'assistant',text,ui,timestamp:Date.now()}});
 }catch(e){console.error('Gateway:',e instanceof Error?e.message:'unknown');res.status(502).json({error:'Integration unavailable'});}
});
app.listen(Number(process.env.PORT||3030),()=>console.log('Integration reference listening'));
