import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {GitWorker} from './git-worker.mjs';
const exec=promisify(execFile);
async function fixture(t) {
  const dir=await mkdtemp(join(tmpdir(),'git-worker-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const repo=join(dir,'repo'),cwd=join(dir,'worker');
  await exec('git',['init','-b','main',repo]);
  const git=async(...args)=>(await exec('git',['-C',repo,...args])).stdout.trim();
  await git('config','user.name','Test');await git('config','user.email','test@example.invalid');
  await writeFile(join(repo,'initial'),'baseline');
  await git('add','.');await git('commit','-m','baseline');
  const baseline=await git('rev-parse','HEAD');
  await git('worktree','add','-b','task',cwd);
  const grant={taskId:'PORTABLE-001',workerId:'worker',generation:1,recordVersion:1,packetRevision:1,
    contracts:{portable:'1'},baseline,ownedPaths:['report.txt'],requiredObligations:['PORT-01'],state:'running',
    budget:{maxMinutes:1,billing:'no-paid-api'},checkpointMinutes:1,testResources:['node']};
  let current=grant;
  const bridge=new GitWorker({authority:async()=>current});
  const script=(path='report.txt')=>"const fs=require('fs'),cp=require('child_process');fs.writeFileSync("+JSON.stringify(path)+",process.cwd());cp.execFileSync('git',['add','--',"+JSON.stringify(path)+"]);cp.execFileSync('git',['commit','-m','artifact']);";
  async function launch(code=script()) {
    const h=await bridge.start(grant,{cwd,command:process.execPath,args:['-e',code]});
    t.after(()=>bridge.cancel(h.id));
    for(let i=0;i<200;i++){if((await bridge.status(h.id)).state!=='running')return h;await new Promise(r=>setTimeout(r,10));}
    throw Error('worker-timeout');
  }
  return {repo,cwd,grant,bridge,launch,script,setCurrent:g=>current=g};
}
test('GW-01/02/03 independent project produces a scoped descendant artifact in assigned worktree',async t=>{
  const f=await fixture(t),h=await f.launch(),r=await f.bridge.result(h.id);
  assert.equal(r.status,'submitted-for-review');assert.deepEqual(r.changedPaths,['report.txt']);
  assert.notEqual(r.artifactRevision,f.grant.baseline);assert.equal(r.generation,1);
});
test('GW-01 primary checkout, stale baseline and dirty worktree rejected before process launch',async t=>{
  const f=await fixture(t),spec={command:process.execPath,args:['-e',"throw Error('must not run')"]};
  await assert.rejects(()=>f.bridge.start(f.grant,{...spec,cwd:f.repo}),/separate-worktree/);
  f.grant.baseline='b'.repeat(40);
  await assert.rejects(()=>f.bridge.start(f.grant,{...spec,cwd:f.cwd}),/baseline-mismatch/);
  await writeFile(join(f.cwd,'untracked'),'keep');
  await assert.rejects(()=>f.bridge.start(f.grant,{...spec,cwd:f.cwd}),/dirty-worktree/);
});
test('GW-04 rejects outside-scope commit without deleting artifact',async t=>{
  const f=await fixture(t),h=await f.launch(f.script('outside.txt'));
  await assert.rejects(()=>f.bridge.result(h.id),/path-ownership/);
});
test('GW-04 rejects uncommitted output, empty success and failed process',async t=>{
  for(const [code,reason] of [["require('fs').writeFileSync('untracked','keep')",/dirty-artifact/],['',/missing-artifact/],['process.exit(4)',/worker-failed/]]) {
    const f=await fixture(t),h=await f.launch(code);await assert.rejects(()=>f.bridge.result(h.id),reason);
  }
});
test('GW-05 grant changes after launch invalidate submission',async t=>{
  const f=await fixture(t),h=await f.launch();
  f.setCurrent({...f.grant,generation:2});
  await assert.rejects(()=>f.bridge.result(h.id),/stale-grant/);
});
test('GW-05 cancellation stops actual process and duplicate workspace launch is rejected',async t=>{
  const f=await fixture(t),spec={cwd:f.cwd,command:process.execPath,args:['-e','setInterval(()=>{},1000)']};
  const h=await f.bridge.start(f.grant,spec);t.after(()=>f.bridge.cancel(h.id));
  await assert.rejects(()=>f.bridge.start(f.grant,spec),/workspace-busy/);
  assert.equal((await f.bridge.cancel(h.id)).stopped,true);
});
