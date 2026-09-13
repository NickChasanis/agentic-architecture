import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CoordinationRegistry} from './registry.mjs';
import {LocalAdapter} from './adapter.mjs';

const rev='a'.repeat(40);
const grant={taskId:'T-2',workerId:'old',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,ownedPaths:['pilot/'],requiredObligations:['X'],state:'running',budget:{maxMinutes:1,billing:'no-paid-api'},checkpointMinutes:1,testResources:['node']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('confirmed cancellation precedes reassignment; old worker cannot write or submit', {timeout:10000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pilot-recovery-'));
 const marker=join(dir,'writes');
 const adapter=new LocalAdapter(),registry=new CoordinationRegistry();
 const run=await adapter.start({command:process.execPath,args:['-e',`const fs=require('node:fs');setInterval(()=>fs.appendFileSync(process.argv[1],'x'),10);`,marker]});
 try{
  registry.grant(grant);
  let before='';
  for(let i=0;i<100&&!before;i++){await sleep(10);before=await readFile(marker,'utf8').catch(()=>'');}
  assert.ok(before.length>0,'old worker actually wrote an artifact');
  assert.throws(()=>registry.reassign(grant.taskId,{...grant,workerId:'new'}),/termination/);
  const stopped=await adapter.cancel(run.id);
  assert.equal(stopped.stopped,true);
  const final=await readFile(marker,'utf8');
  const replacement=registry.reassign(grant.taskId,{...grant,workerId:'new'},{...stopped,workerId:'old',generation:1,evidence:run.id});
  assert.equal(replacement.generation,2);
  await sleep(60);
  assert.equal(await readFile(marker,'utf8'),final,'old writer stays stopped');
  const late={submissionId:'late',taskId:'T-2',workerId:'old',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,artifactRevision:rev,artifactLocation:'git:'+rev,changedPaths:['pilot/a'],checks:[],unrunChecks:['X'],limitations:[]};
  assert.equal(registry.submit(late).status,'rejected');
  assert.equal(registry.submit({...late,workerId:'new'}).reason,'generation');
  assert.deepEqual(registry.events().slice(0,3).map(e=>e.type),['grant','termination-confirmed','grant']);
 }finally{await adapter.cancel(run.id);await rm(dir,{recursive:true,force:true});}
});
