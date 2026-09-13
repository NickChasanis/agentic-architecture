// Runs inside a private tmux session. Reuses the local process-group engine;
// the transport changes, while process termination semantics stay shared.
import {readFile,writeFile,rename,access} from 'node:fs/promises';
import {join} from 'node:path';
import {LocalAdapter} from './adapter.mjs';
const dir=process.argv[2];
const file=join(dir,'state.json');
async function publish(state){await writeFile(file+'.tmp',JSON.stringify(state),{mode:0o600});await rename(file+'.tmp',file);}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const a=new LocalAdapter();let run;
try{
 const spec=JSON.parse(await readFile(join(dir,'spec.json'),'utf8'));
 run=await a.start(spec);
 await publish({state:'running'});
 for(;;){
  const cancel=await access(join(dir,'cancel')).then(()=>true,()=>false);
  if(cancel){const receipt=await a.cancel(run.id);await publish({state:receipt.stopped?'stopped':'failed',receipt});break;}
  const status=await a.status(run.id);
  if(status.state!=='running'){
   try{
    const result=await a.result(run.id),receipt=await a.cancel(run.id);
    await publish({state:receipt.stopped?status.state:'failed',result,receipt});break;
   }
   catch(e){if(e.message!=='result-not-ready')throw e;}
  }
  await sleep(20);
 }
}catch(e){if(run)await a.cancel(run.id);await publish({state:'failed',result:{output:'',error:'runner failed',code:null}});}
