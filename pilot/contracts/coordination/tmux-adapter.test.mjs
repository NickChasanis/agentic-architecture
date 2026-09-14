import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LocalAdapter} from './adapter.mjs';
import {TmuxAdapter} from './tmux-adapter.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('tmux status rechecks persisted completion when session disappears after first read',async()=>{
 const a=new TmuxAdapter();let reads=0;
 a.get=()=>({});
 a.read=async()=>++reads===1?{state:'running'}:{state:'completed',result:{code:0},receipt:{stopped:true}};
 a.command=async()=>{throw Error('session gone');};
 assert.equal((await a.status('simulated-race')).state,'completed');
 assert.equal(reads,2);
});
test('tmux missing session with no final record remains lost',async()=>{
 const a=new TmuxAdapter();
 a.get=()=>({});a.read=async()=>({state:'running'});
 a.command=async()=>{throw Error('session gone');};
 assert.equal((await a.status('lost')).state,'lost');
});
async function finish(adapter,id){
 for(let i=0;i<200;i++){const s=await adapter.status(id);if(s.state!=='running')return s;await sleep(20);}
 throw Error('run-timeout');
}
for(const [name,make] of [['local',()=>new LocalAdapter()],['tmux',()=>new TmuxAdapter()]]){
 test(`${name}: shared success, failure and argument contract`,{timeout:15000},async t=>{
  const a=make(),ids=[];
  t.after(async()=>{for(const id of ids){await a.cancel(id);await a.dispose?.(id);}});
  const literal='spaces ; $(echo unsafe) " quotes';
  const r=await a.start({command:process.execPath,args:['-e','process.stdout.write(process.argv[1])',literal]});ids.push(r.id);
  assert.equal((await finish(a,r.id)).state,'completed');assert.equal((await a.result(r.id)).output,literal);
  assert.equal((await a.cancel(r.id)).stopped,true);
  const bad=await a.start({command:process.execPath,args:['-e','process.stderr.write("bad");process.exit(3)']});ids.push(bad.id);
  assert.equal((await finish(a,bad.id)).state,'failed');assert.equal((await a.result(bad.id)).code,3);
  const missing=await a.start({command:'/definitely/missing-pilot-command'});ids.push(missing.id);
  assert.equal((await finish(a,missing.id)).state,'failed');
 });
 test(`${name}: running result rejected and cancellation confirmed`,{timeout:15000},async t=>{
  const a=make();const r=await a.start({command:process.execPath,args:['-e','setInterval(()=>{},1000)']});
  t.after(async()=>{await a.cancel(r.id);await a.dispose?.(r.id);});
  await assert.rejects(a.result(r.id),/result-not-ready/);
  assert.equal((await a.cancel(r.id)).stopped,true);
  assert.equal((await a.cancel(r.id)).stopped,true);
  assert.equal((await a.status(r.id)).state,'stopped');
 });
}
