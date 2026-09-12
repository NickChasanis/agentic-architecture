import {isDeepStrictEqual} from 'node:util';
import {checkSubmission} from './check-submission.mjs';

const copy=value=>structuredClone(value);

export class CoordinationRegistry {
 constructor(clock=()=>new Date()){this.clock=clock;this.grants=new Map();this.receipts={};this.log=[];}
 stamp(type,payload){this.log.push(Object.freeze({type,at:this.clock().toISOString(),payload:copy(payload)}));}
 grant(grant){
  const current=this.grants.get(grant.taskId);
  if(current&&current.state==='running'&&!isDeeplySameAssignment(current,grant))throw new Error('claim-conflict');
  this.grants.set(grant.taskId,copy(grant));this.stamp('grant',grant);return copy(grant);
 }
 submit(submission){
  const grant=this.grants.get(submission.taskId);
  if(!grant)return {status:'rejected',reason:'unknown-task'};
  const result=checkSubmission(submission,grant,this.receipts);
  if(result.status==='accepted-for-review')this.receipts[submission.submissionId]=copy(submission);
  if(result.status!=='duplicate')this.stamp('submission', {submissionId:submission.submissionId,result});
  return result;
 }
 reassign(taskId,next){const current=this.grants.get(taskId);if(!current)throw new Error('unknown-task');this.grants.set(taskId,{...current,state:'cancelled'});const grant={...copy(next),taskId,generation:current.generation+1,recordVersion:current.recordVersion+1,state:'running'};return this.grant(grant);}
 events(){return this.log.map(copy);}
}
function isDeeplySameAssignment(a,b){return a.workerId===b.workerId&&a.generation===b.generation&&a.baseline===b.baseline;}
