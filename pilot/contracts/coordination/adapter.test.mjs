import {test} from 'node:test';
import assert from 'node:assert/strict';
import {conform,LocalAdapter,FakeAdapter} from './adapter.mjs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('local lifecycle captures success and rejects premature result',async()=>{const a=new LocalAdapter();const run=await a.start({command:'node',args:['-e','setTimeout(()=>console.log("ok"),30)']});await assert.rejects(a.result(run.id),/result-not-ready/);while((await a.status(run.id)).state==='running')await sleep(10);assert.equal((await a.result(run.id)).output.trim(),'ok');assert.equal(conform(a).length,0);});
test('spawn failures and nonzero exits are represented',async()=>{const a=new LocalAdapter();const run=await a.start({command:'/definitely/missing'});while((await a.status(run.id)).state==='running')await sleep(5);assert.equal((await a.status(run.id)).state,"failed");const bad=await a.start({command:'node',args:['-e','process.stderr.write("bad");process.exit(3)']});while((await a.status(bad.id)).state==='running')await sleep(5);const result=await a.result(bad.id);assert.equal(result.code,3);assert.equal(result.error,'bad');});
test('cancel confirms termination after a descendant announces readiness',{timeout:5000},async()=>{
 const a=new LocalAdapter();
 const program='const child=require("child_process").spawn(process.execPath,["-e",\'process.stdout.write("child-ready");setInterval(()=>{},1000)\'],{stdio:["ignore","inherit","inherit"]});process.on("SIGTERM",()=>child.once("exit",()=>process.exit()));setInterval(()=>{},1000);';
 const run=await a.start({command:process.execPath,args:['-e',program]});
 try{
  for(let i=0;i<200&&!a.runs.get(run.id).out.includes('child-ready');i++)await sleep(5);
  assert.match(a.runs.get(run.id).out,/child-ready/);
  assert.deepEqual(await a.cancel(run.id),{supported:true,stopped:true});
  assert.equal((await a.status(run.id)).state,'stopped');
 }finally{await a.cancel(run.id);}
});
test('TERM-ignoring process is escalated and repeated cancel is safe',async()=>{const a=new LocalAdapter();const run=await a.start({command:'node',args:['-e','process.on("SIGTERM",()=>{});process.stdout.write("ready\\n");setTimeout(()=>{},10000)']});while((await a.status(run.id)).state==='running'&&(a.runs.get(run.id).out!=='ready\n'))await sleep(5);assert.deepEqual(await a.cancel(run.id),{supported:true,stopped:true});assert.deepEqual(await a.cancel(run.id),{supported:true,stopped:true});});
test('fake is independent deterministic double',async()=>{const a=new FakeAdapter();const run=await a.start({output:'fake'});assert.equal((await a.result(run.id)).output,'fake');assert.equal(conform(a).length,0);assert.equal((await new FakeAdapter({cancel:false}).cancel(run.id)).supported,false);});
