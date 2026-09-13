import {isDeepStrictEqual} from 'node:util';
import Ajv from 'ajv';
import {readFileSync} from 'node:fs';
import {checkSubmission} from './check-submission.mjs';

const schema=JSON.parse(readFileSync(new URL('./work.schema.json',import.meta.url)));
const valid=new Ajv().compile(schema.definitions.grant);
const copy=value=>structuredClone(value);
const safe=p=>typeof p==='string'&&!p.startsWith('/')&&!p.includes('\\')&&p.replace(/\/$/,'').split('/').every(s=>s&&s!=='.'&&s!=='..');
const overlap=(a,b)=>{a=a.replace(/\/$/,'');b=b.replace(/\/$/,'');return a===b||a.startsWith(b+'/')||b.startsWith(a+'/');};

// Single coordinator in memory; termination confirmation is trusted operator
// evidence. This registry cannot itself fence filesystem access or processes.
export class CoordinationRegistry {
 #grants=new Map(); #receipts=Object.create(null); #log=[];
 constructor(clock=()=>new Date()){this.clock=clock;}
 stamp(type,payload){this.#log.push({sequence:this.#log.length+1,type,at:this.clock().toISOString(),payload:copy(payload)});}
 validate(grant,except){
  if(!valid(grant)||grant.state!=='running'||!grant.ownedPaths.every(safe))throw new Error('invalid-grant');
  for(const [id,current] of this.#grants)if(id!==except&&current.state==='running'&&current.ownedPaths.some(a=>grant.ownedPaths.some(b=>overlap(a,b))))throw new Error('path-conflict');
 }
 grant(grant){
  this.validate(grant,grant.taskId);
  const current=this.#grants.get(grant.taskId);
  if(current){if(isDeepStrictEqual(current,grant))return copy(current);throw new Error('claim-conflict');}
  this.#grants.set(grant.taskId,copy(grant));this.stamp('grant',grant);return copy(grant);
 }
 submit(submission){
  const grant=this.#grants.get(submission?.taskId);
  if(!grant)return {status:'rejected',reason:'unknown-task'};
  const result=checkSubmission(submission,grant,this.#receipts);
  if(result.status==='accepted-for-review')this.#receipts[submission.submissionId]=copy(submission);
  if(result.status!=='duplicate')this.stamp('submission',{submissionId:submission.submissionId,result});
  return result;
 }
 reassign(taskId,next,confirmation){
  const current=this.#grants.get(taskId);if(!current)throw new Error('unknown-task');
  if(confirmation?.stopped!==true||confirmation.workerId!==current.workerId||confirmation.generation!==current.generation||!confirmation.evidence)throw new Error('termination-confirmation-required');
  const grant={...copy(next),taskId,generation:current.generation+1,recordVersion:current.recordVersion+1,state:'running'};
  this.validate(grant,taskId);
  this.stamp('termination-confirmed',confirmation);
  this.#grants.set(taskId,grant);this.stamp('grant',grant);return copy(grant);
 }
 events(){return this.#log.map(copy);}
}
