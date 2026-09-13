import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
const exec=promisify(execFile),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const runner=fileURLToPath(new URL('./tmux-runner.mjs',import.meta.url));

export class TmuxAdapter {
 #runs=new Map();
 constructor(){this.socket='pilot-'+randomUUID();}
 command(...args){return exec('tmux',['-L',this.socket,'-f','/dev/null',...args],{timeout:3000,maxBuffer:65536});}
 get(id){const run=this.#runs.get(id);if(!run)throw Error('unknown-run');return run;}
 async read(run){return JSON.parse(await readFile(join(run.dir,'state.json'),'utf8'));}
 async start(spec){
  if(typeof spec?.command!=='string'||!Array.isArray(spec.args??[])||(spec.args??[]).some(a=>typeof a!=='string'))throw Error('invalid-command');
  const id='run-'+randomUUID(),dir=await mkdtemp(join(tmpdir(),'pilot-tmux-'));
  const run={id,dir};this.#runs.set(id,run);
  try{
   await writeFile(join(dir,'spec.json'),JSON.stringify(spec),{mode:0o600});
   // Multiple argv entries invoke the runner directly; no shell interpolation.
   await this.command('new-session','-d','-s',id,'-c',process.cwd(),process.execPath,runner,dir);
   for(let i=0;i<150;i++){
    try{await this.read(run);return {id};}catch(e){if(e.code!=='ENOENT')throw e;}
    await sleep(20);
   }
   throw Error('runner-start-timeout');
  }catch(e){
   // Preserve a potentially running workload for operator recovery on timeout.
   if(e.message==='runner-start-timeout'){e.runId=id;throw e;}
   await rm(dir,{recursive:true,force:true});this.#runs.delete(id);throw e;
  }
 }
 async status(id){
  const run=this.get(id),s=await this.read(run);
  if(s.state==='running'){
   try{await this.command('has-session','-t',id);}catch{return {state:'lost'};}
  }
  return {state:s.state};
 }
 async result(id){
  const run=this.get(id),s=await this.read(run);
  if(s.state==='running'||!s.result)throw Error('result-not-ready');
  return s.result;
 }
 async cancel(id){
  if(!this.#runs.has(id))return {supported:false};
  const run=this.get(id),s=await this.read(run);
  if(s.receipt)return s.receipt;
  if(s.state!=='running')return {supported:true,stopped:false,error:'termination-not-confirmed'};
  await writeFile(join(run.dir,'cancel'),'cancel',{mode:0o600});
  for(let i=0;i<200;i++){
   const current=await this.read(run);
   if(current.receipt)return current.receipt;
   await sleep(20);
  }
  return {supported:true,stopped:false,error:'termination-not-confirmed'};
 }
 async dispose(id){
  const run=this.get(id),s=await this.read(run);
  if(s.state==='running'||s.receipt?.stopped!==true)throw Error('termination-not-confirmed');
  // Only remove completed run records; never kill an entire tmux server.
  await rm(run.dir,{recursive:true,force:true});this.#runs.delete(id);
 }
}
