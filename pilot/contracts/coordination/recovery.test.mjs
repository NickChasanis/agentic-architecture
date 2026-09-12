import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CoordinationRegistry} from './registry.mjs';
const rev='a'.repeat(40);const grant={taskId:'T-2',workerId:'old',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,ownedPaths:['pilot/'],requiredObligations:['X'],state:'running',budget:{maxMinutes:1,billing:'no-paid-api'},checkpointMinutes:1,testResources:['node']};
test('reassignment increments generation and rejects a late old result',()=>{const r=new CoordinationRegistry();r.grant(grant);const next=r.reassign('T-2',{...grant,workerId:'new'});assert.equal(next.generation,2);const late={submissionId:'late',taskId:'T-2',workerId:'new',generation:1,recordVersion:1,packetRevision:1,contracts:{x:'1'},baseline:rev,artifactRevision:rev,artifactLocation:'git:'+rev,changedPaths:['pilot/a'],checks:[],unrunChecks:['X'],limitations:[]};assert.equal(r.submit(late).reason,'generation');});
