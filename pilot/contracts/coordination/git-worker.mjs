import {execFile} from 'node:child_process';
import {promisify,isDeepStrictEqual} from 'node:util';
import {realpath} from 'node:fs/promises';
import {LocalAdapter} from './adapter.mjs';
import {CoordinationRegistry} from './registry.mjs';

const exec = promisify(execFile);
async function git(cwd, ...args) {
  return (await exec('git', ['-C',cwd,...args], {maxBuffer:1024*1024,timeout:10000})).stdout;
}
const scoped = (path, roots) => roots.some(root => root.endsWith('/') ? path.startsWith(root) : path === root);

// Supervised bridge. The coordinator supplies live authority and transports a
// provider-specific argv. Neither Git nor this adapter enforces OS isolation.
export class GitWorker {
  constructor({authority, adapter = new LocalAdapter()} = {}) {
    if (typeof authority !== 'function') throw Error('live-authority-required');
    this.authority = authority;
    this.adapter = adapter;
    this.runs = new Map();
    this.pending = new Set();
  }
  async validate(grant) {
    const current = await this.authority(grant.taskId);
    if (!isDeepStrictEqual(current, grant)) throw Error('stale-grant');
    new CoordinationRegistry().grant(current);
  }
  async start(grant, {cwd,command,args=[]}) {
    await this.validate(grant);
    if (typeof command !== 'string' || !command || !Array.isArray(args) || args.some(a=>typeof a!=='string')) throw Error('invalid-command');
    cwd = await realpath(cwd);
    if (this.pending.has(cwd) || [...this.runs.values()].some(r=>r.cwd===cwd && !r.released)) throw Error('workspace-busy');
    this.pending.add(cwd);
    try {
      const root = await realpath((await git(cwd,'rev-parse','--show-toplevel')).trim());
      if (root !== cwd) throw Error('worktree-root-required');
      const records = (await git(cwd,'worktree','list','--porcelain','-z')).split('\0\0').filter(Boolean);
      const paths = records.map(r=>r.split('\0').find(l=>l.startsWith('worktree '))?.slice(9)).filter(Boolean);
      if (await realpath(paths[0]) === cwd || !paths.includes(cwd)) throw Error('separate-worktree-required');
      await git(cwd,'symbolic-ref','--quiet','HEAD');
      if ((await git(cwd,'status','--porcelain','--untracked-files=all')).trim()) throw Error('dirty-worktree');
      if ((await git(cwd,'rev-parse','HEAD')).trim() !== grant.baseline) throw Error('baseline-mismatch');
      await this.validate(grant);
      const handle = await this.adapter.start({command,args,cwd});
      this.runs.set(handle.id, {grant:structuredClone(grant),cwd,startedAt:new Date().toISOString(),released:false});
      return handle;
    } finally { this.pending.delete(cwd); }
  }
  get(id) {
    const run=this.runs.get(id);
    if (!run) throw Error('unknown-run');
    return run;
  }
  async status(id) { this.get(id); return this.adapter.status(id); }
  async cancel(id) {
    const run=this.get(id), receipt=await this.adapter.cancel(id);
    if (receipt.stopped===true) run.released=true;
    return receipt;
  }
  async result(id) {
    const run=this.get(id);
    await this.validate(run.grant);
    const result=await this.adapter.result(id);
    const stopped=await this.cancel(id);
    if (stopped.stopped!==true) throw Error('termination-not-confirmed');
    if (result.code!==0) throw Error('worker-failed');
    if ((await git(run.cwd,'status','--porcelain','--untracked-files=all')).trim()) throw Error('dirty-artifact');
    const revision=(await git(run.cwd,'rev-parse','HEAD')).trim();
    if (revision===run.grant.baseline) throw Error('missing-artifact-commit');
    await git(run.cwd,'merge-base','--is-ancestor',run.grant.baseline,revision);
    const changedPaths=(await git(run.cwd,'diff','--no-renames','--name-only','-z',run.grant.baseline,revision)).split('\0').filter(Boolean);
    if (!changedPaths.length) throw Error('empty-artifact');
    if (changedPaths.some(p=>!scoped(p,run.grant.ownedPaths))) throw Error('path-ownership');
    await this.validate(run.grant);
    return {status:'submitted-for-review',taskId:run.grant.taskId,workerId:run.grant.workerId,generation:run.grant.generation,
      baseline:run.grant.baseline,artifactRevision:revision,artifactLocation:'git:'+revision,changedPaths,
      startedAt:run.startedAt,endedAt:new Date().toISOString(),process:result,
      limitations:['Commands and worktrees are not an OS sandbox.','Checks and integration require coordinator review.']};
  }
}
