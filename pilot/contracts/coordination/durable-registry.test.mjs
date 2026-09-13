import {test} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {DurableCoordinationRegistry} from './durable-registry.mjs';
import {inspectRecovery} from './recovery-inspection.mjs';
import {LocalAdapter} from './adapter.mjs';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const run=promisify(execFile);
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url)));
const rev='b'.repeat(40);
const grant={taskId:'DUR-TEST',workerId:'w',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,ownedPaths:['pilot/'],requiredObligations:['X'],state:'running',budget:{maxMinutes:1,billing:'no-paid-api'},checkpointMinutes:1,testResources:['node']};
const submission={submissionId:'DUR-S-1',taskId:'DUR-TEST',workerId:'w',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,artifactRevision:rev,artifactLocation:`git:${rev}`,changedPaths:['pilot/a'],checks:[{obligation:'X',command:'test',environment:'local',testedRevision:rev,startedAt:'2026-01-01T00:00:00Z',endedAt:'2026-01-01T00:01:00Z',outcome:'pass',evidenceLocation:'e'}],unrunChecks:[],limitations:[]};
async function fixture(t){
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const namespace='dur-test-'+randomUUID(),r=new DurableCoordinationRegistry({pool,namespace});
 t.after(async()=>{
  try{for(const table of ['events','receipts','grants','namespaces'])await pool.query(`DELETE FROM coordination.${table} WHERE namespace_id=$1`,[namespace]);}
  finally{await pool.end();}
 });
 await r.init();return r;
}
const child=(r,script,extra={})=>run(process.execPath,['--input-type=module','-e',script],{timeout:15000,maxBuffer:100000,env:{...process.env,COORDINATION_DATABASE_URL:config.databaseUrl,N:r.namespace,G:JSON.stringify(grant),S:JSON.stringify(submission),...extra}});
const prefix="import {DurableCoordinationRegistry} from './contracts/coordination/durable-registry.mjs';const r=new DurableCoordinationRegistry({namespace:process.env.N});";
test('DUR-01 full grant and receipt survive fresh process, retry has one effect',async t=>{
 const r=await fixture(t);await r.grant(grant,0);assert.equal((await r.submit(submission)).status,'accepted-for-review');
 const out=await child(r,prefix+"console.log(JSON.stringify({snapshot:await r.snapshot(),result:await r.submit(JSON.parse(process.env.S))}));await r.close();");
 const data=JSON.parse(out.stdout);assert.equal(data.snapshot.grants[0].reconciliationRequired,true);assert.equal(data.result.status,'duplicate');assert.equal(data.snapshot.revision,2);
 assert.deepEqual(data.snapshot.grants[0],{...grant,reconciliationRequired:true});assert.equal((await r.events()).length,2);
 assert.deepEqual((await r.pool.query('SELECT submission FROM coordination.receipts WHERE namespace_id=$1',[r.namespace])).rows[0].submission,submission);
});
test('DUR-02 competing fresh-process writers serialize and exactly one CAS succeeds',async t=>{
 const r=await fixture(t);
 const script=prefix+"try{await r.grant(JSON.parse(process.env.G),0);console.log('ok');}catch(e){console.log(e.message);}finally{await r.close();}";
 const out=await Promise.all([child(r,script),child(r,script)]);assert.deepEqual(out.map(x=>x.stdout.trim()).sort(),['ok','revision-conflict']);assert.equal((await r.snapshot()).revision,1);assert.equal((await r.events()).length,1);
});
test('DUR-03 malformed grants, overlapping paths and unsafe revisions leave state unchanged',async t=>{
 const r=await fixture(t);
 for(const expected of [undefined,-1,NaN,0.5,'0'])await assert.rejects(()=>r.grant(grant,expected),/revision-conflict/);
 await assert.rejects(()=>r.grant({...grant,ownedPaths:['../outside']},0),/invalid-grant/);assert.equal((await r.snapshot()).revision,0);
 await r.grant(grant,0);await assert.rejects(()=>r.grant({...grant,taskId:'OTHER',ownedPaths:['pilot/nested']},1),/path-conflict/);
 assert.equal((await r.events()).length,1);assert.equal((await r.snapshot()).grants.length,1);
});
test('DUR-04 reassignment needs current termination evidence and rejects late generation',async t=>{
 const r=await fixture(t);await r.grant(grant,0);const next={...grant,workerId:'replacement'};
 for(const evidence of [{},{stopped:false},{stopped:true,workerId:'wrong',generation:1,evidence:'x'},{stopped:true,workerId:'w',generation:0,evidence:'x'}])await assert.rejects(()=>r.reassign(grant.taskId,next,evidence,1),/termination/);
 const confirmation={stopped:true,workerId:'w',generation:1,evidence:'operator observed process group stopped'};
 await assert.rejects(()=>r.reassign(grant.taskId,next,confirmation,0),/revision/);
 const updated=await r.reassign(grant.taskId,next,confirmation,1);assert.equal(updated.generation,2);assert.equal(updated.recordVersion,2);
 assert.equal((await r.submit({...submission,workerId:'replacement'})).reason,'generation');
 assert.equal((await r.submit({...submission,workerId:'replacement',generation:2,recordVersion:2})).status,'accepted-for-review');
 assert.equal((await r.snapshot()).revision,4);assert.equal((await r.events()).length,4);
});
test('DUR-05 duplicate conflict does not overwrite complete receipt',async t=>{
 const r=await fixture(t);await r.grant(grant,0);await r.submit(submission);
 assert.equal((await r.submit({...submission,limitations:['changed']})).reason,'duplicate-conflict');assert.equal((await r.snapshot()).revision,2);assert.equal((await r.events()).length,2);
});
test('DUR-06 process exits before commit: grant and event both roll back',async t=>{
 const r=await fixture(t);
 const script="import pg from 'pg';const p=new pg.Pool({connectionString:process.env.COORDINATION_DATABASE_URL});const c=await p.connect();await c.query('BEGIN');await c.query('INSERT INTO coordination.grants VALUES($1,$2,$3)',[process.env.N,'DUR-TEST',JSON.parse(process.env.G)]);await c.query(\"INSERT INTO coordination.events VALUES($1,1,'grant',now(),$2)\",[process.env.N,JSON.parse(process.env.G)]);await c.query('UPDATE coordination.namespaces SET revision=1,event_sequence=1 WHERE namespace_id=$1',[process.env.N]);process.exit(17);";
 await assert.rejects(()=>child(r,script),e=>e.code===17);
 assert.deepEqual((await r.snapshot()).grants,[]);assert.equal((await r.snapshot()).revision,0);assert.deepEqual(await r.events(),[]);
});
test('DUR-07 process commits then exits before caller acknowledgment: retry is duplicate',async t=>{
 const r=await fixture(t);await r.grant(grant,0);
 await assert.rejects(()=>child(r,prefix+"await r.submit(JSON.parse(process.env.S));process.exit(19);"),e=>e.code===19);
 assert.equal((await r.submit(submission)).status,'duplicate');assert.equal((await r.events()).length,2);assert.equal((await r.snapshot()).revision,2);
});
test('DUR-08 transaction event failure rolls back registry grant mutation',async t=>{
 const r=await fixture(t);
 // Occupy the sequence to cause the registry's event INSERT to fail after its grant INSERT.
 await r.pool.query("INSERT INTO coordination.events VALUES($1,1,'fixture',now(),'{}')",[r.namespace]);
 await assert.rejects(()=>r.grant(grant,0));assert.deepEqual((await r.snapshot()).grants,[]);assert.equal((await r.snapshot()).revision,0);assert.equal((await r.events()).length,1);
});
test('DUR-09 closed storage refuses mutation without acknowledgment',async t=>{
 const r=await fixture(t);const closedPool=new pg.Pool({connectionString:config.databaseUrl});await closedPool.end();
 const unavailable=new DurableCoordinationRegistry({pool:closedPool,namespace:r.namespace});await assert.rejects(()=>unavailable.grant(grant,0));await assert.rejects(()=>unavailable.submit(submission));
 assert.deepEqual((await r.snapshot()).grants,[]);assert.equal((await r.events()).length,0);
});
test('DUR-10 unsupported schema blocks mutations and inspection fails explicitly',async t=>{
 const r=await fixture(t);await r.pool.query('UPDATE coordination.namespaces SET schema_version=2 WHERE namespace_id=$1',[r.namespace]);
 await assert.rejects(()=>r.grant(grant,0),/unsupported-schema/);await assert.rejects(()=>r.snapshot(),/unsupported-schema/);
});
test('DUR-11 inspection works in read-only database transaction and preserves revision',async t=>{
 const r=await fixture(t);await r.grant(grant,0);const c=await r.pool.connect();
 try{
  await c.query('SET default_transaction_read_only=on');
  const facade={connect:async()=>({query:c.query.bind(c),release(){}})};
  const info=await inspectRecovery({pool:facade,namespace:r.namespace});assert.deepEqual(info.interrupted,[{taskId:grant.taskId,workerId:'w',generation:1,recordVersion:1}]);
 }finally{await c.query('SET default_transaction_read_only=off');c.release();}
 assert.equal((await r.snapshot()).revision,1);
 const output=await run(process.execPath,['contracts/coordination/recovery-inspection.mjs',r.namespace],{env:{...process.env,COORDINATION_DATABASE_URL:config.databaseUrl},timeout:15000});assert.equal(JSON.parse(output.stdout).interrupted.length,1);
});
test('DUR-12 restored grant requires actual writer termination before replacement',{timeout:10000},async t=>{
 const r=await fixture(t);await r.grant(grant,0);
 const dir=await mkdtemp(join(tmpdir(),'durable-recovery-')),marker=join(dir,'artifact');
 const adapter=new LocalAdapter(),writer=await adapter.start({command:process.execPath,args:['-e',"const fs=require('node:fs');setInterval(()=>fs.appendFileSync(process.argv[1],'x'),10);",marker]});
 try{
  let before='';for(let i=0;i<100&&!before;i++){await new Promise(r=>setTimeout(r,10));before=await readFile(marker,'utf8').catch(()=>'');}assert.ok(before.length);
  const restored=await child(r,prefix+"console.log(JSON.stringify(await r.snapshot()));await r.close();");assert.equal(JSON.parse(restored.stdout).grants[0].reconciliationRequired,true);
  await assert.rejects(()=>r.reassign(grant.taskId,{...grant,workerId:'new'},{stopped:false},1),/termination/);assert.equal((await r.snapshot()).grants[0].generation,1);
  const receipt=await adapter.cancel(writer.id);assert.equal(receipt.stopped,true);const last=await readFile(marker,'utf8');
  await r.reassign(grant.taskId,{...grant,workerId:'new'},{...receipt,workerId:'w',generation:1,evidence:writer.id},1);
  await new Promise(r=>setTimeout(r,60));assert.equal(await readFile(marker,'utf8'),last);assert.equal((await r.submit({...submission,workerId:'new'})).reason,'generation');
 }finally{await adapter.cancel(writer.id);await rm(dir,{recursive:true,force:true});}
});
