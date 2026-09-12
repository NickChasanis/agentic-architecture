import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CoordinationRegistry} from './registry.mjs';

const rev='a'.repeat(40);
const grant={taskId:'T-1',workerId:'worker-1',generation:1,recordVersion:1,packetRevision:1,contracts:{catalog:'1.0'},baseline:rev,ownedPaths:['pilot/'],requiredObligations:['PUB-01'],state:'running',budget:{maxMinutes:10,billing:'no-paid-api'},checkpointMinutes:5,testResources:['node']};
const submission={submissionId:'S-1',taskId:'T-1',workerId:'worker-1',generation:1,recordVersion:1,packetRevision:1,contracts:{catalog:'1.0'},baseline:rev,artifactRevision:rev,artifactLocation:'git:'+rev,changedPaths:['pilot/a.ts'],checks:[{obligation:'PUB-01',command:'test',environment:'local',testedRevision:rev,startedAt:'2026-09-12T00:00:00Z',endedAt:'2026-09-12T00:01:00Z',outcome:'pass',evidenceLocation:'evidence/a'}],unrunChecks:[],limitations:[]};
test('registry records grant and accepts a valid submission for review',()=>{const r=new CoordinationRegistry(()=>new Date('2026-09-12T01:00:00Z'));r.grant(grant);assert.equal(r.submit(submission).status,'accepted-for-review');assert.equal(r.events().length,2);});
test('registry rejects stale generations and conflicting duplicate IDs',()=>{const r=new CoordinationRegistry();r.grant(grant);assert.equal(r.submit({...submission,generation:2}).status,'rejected');assert.equal(r.submit(submission).status,'accepted-for-review');assert.equal(r.submit({...submission,limitations:['changed']}).status,'rejected');});
