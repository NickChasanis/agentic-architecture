import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {DurableCoordinationRegistry} from './durable-registry.mjs';

// Inspection never initializes a namespace or grants execution authority.
export async function inspectRecovery({pool,namespace='default'}={}){
 const registry=new DurableCoordinationRegistry({pool,namespace});
 try{
  const snapshot=await registry.snapshot();
  return {namespace:snapshot.namespace,revision:snapshot.revision,schemaVersion:snapshot.schemaVersion,
   interrupted:snapshot.grants.filter(g=>g.reconciliationRequired).map(g=>({taskId:g.taskId,workerId:g.workerId,generation:g.generation,recordVersion:g.recordVersion}))};
 }finally{await registry.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{console.log(JSON.stringify(await inspectRecovery({namespace:process.argv[2]||'default'})));}
 catch{console.error('Recovery inspection failed; check namespace, schema version and storage availability.');process.exitCode=1;}
}
