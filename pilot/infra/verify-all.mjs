import {spawnSync,execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const cwd=fileURLToPath(new URL('../',import.meta.url));
const connected=process.argv.includes('--connected');
const commands=[
 ['python3',['contracts/check_contracts.py']],
 [process.execPath,['infra/check-doc-links.mjs']],
 ['npm',['run','check:boundaries']],
 ['npx',['tsc','--noEmit']],
 ['npm',['run','test:contracts']],
 ['npm',['run','test:coordination']],
 ['npm',['run','test:consumers']],
 ['npm',['run','test:registry']],
 ['npm',['run','test:adapters']],
 ['npm',['run','test:operations']],
 ['npm',['run','test:portable']],
 ['npm',['run','build:merchant']],
];
if(connected) {
 if(!existsSync(new URL('../.local/config.json',import.meta.url))) {
   console.error('Connected verification requires setup, an isolated running Compose stack, and seeded database.');process.exit(1);
 }
 commands.push(...['check:provider','test:integration','test:durable','test:backup','test:e2e'].map(name=>['npm',['run',name]]));
}
export async function runVerification({cwd:runCwd=cwd,commands:runCommands=commands}={}) {
 for(const [cmd,args] of runCommands) {
  if(typeof cmd==='function') { await cmd(); continue; }
  const result=spawnSync(cmd,args,{cwd:runCwd,stdio:'inherit'});
  if(result.error||result.status!==0) { const error=new Error('FAILED: '+[cmd,...args].join(' ')); error.exitCode=result.status||1; throw error; }
 }
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
const dirty=execFileSync('git',['status','--porcelain'],{cwd,encoding:'utf8'}).trim().length>0;
console.log(JSON.stringify({revision,dirty,connected,startedAt:new Date().toISOString()}));
try { await runVerification({cwd}); } catch(error) { console.error(error.message); process.exit(error.exitCode||1); }
console.log(JSON.stringify({revision,dirty,connected,outcome:'pass',endedAt:new Date().toISOString()}));
}

