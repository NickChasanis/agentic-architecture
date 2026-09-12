import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSubmission } from './check-submission.mjs';

const rev = 'a'.repeat(40);
const grant = { taskId:'T-1', workerId:'worker-1', generation:2, recordVersion:4,
  packetRevision:1, contracts:{foundation:'1.0'}, baseline:rev, ownedPaths:['pilot/modules/shops/'],
  requiredObligations:['AUTH-03'], state:'running',budget:{maxMinutes:60,billing:'no-paid-api'},
  checkpointMinutes:15,testResources:['isolated-db'] };
const submission = { submissionId:'S-1', taskId:'T-1', workerId:'worker-1', generation:2,
  recordVersion:4, packetRevision:1, contracts:{foundation:'1.0'}, baseline:rev,
  artifactRevision:rev, artifactLocation:'git:'+rev, changedPaths:['pilot/modules/shops/service.ts'],
  checks:[{obligation:'AUTH-03',command:'npm test',environment:'isolated',testedRevision:rev,
    startedAt:'2026-09-11T12:00:00Z',endedAt:'2026-09-11T12:01:00Z',outcome:'pass',evidenceLocation:'evidence/result.txt'}],
  unrunChecks:[], limitations:[] };
const run = (s = {}, g = {}, receipts = {}) => checkSubmission({...submission,...s},{...grant,...g},receipts);
test('yesterday valid submission enters review, never verified',()=>assert.equal(run().status,'accepted-for-review'));
for (const [name, change] of Object.entries({
  generation:{generation:1}, worker:{workerId:'wrong'}, packet:{packetRevision:0},
  contract:{contracts:{foundation:'old'}}, baseline:{baseline:'b'.repeat(40)},
  paths:{changedPaths:['pilot/modules/shops/../identity/service.ts']},
  prefix:{changedPaths:['pilot/modules/shops-other/a.ts']},
  missing:{checks:[]}, mismatch:{checks:[{...submission.checks[0],testedRevision:'b'.repeat(40)}]},
  unrun:{unrunChecks:['AUTH-03']}, malformed:{artifactRevision:'main'},
  invalidDate:{checks:[{...submission.checks[0],startedAt:'2026-02-30T12:00:00Z'}]},
  futureRecord:{recordVersion:5},
  mutableLocation:{artifactLocation:'git:main'},
})) test('rejects '+name,()=>assert.equal(run(change).status,'rejected'));
test('old record requires revalidation, not silent acceptance',()=>assert.equal(run({recordVersion:3}).status,'needs-revalidation'));
test('superseded task cannot be resumed because date matches',()=>assert.equal(run({}, {state:'verified'}).status,'rejected'));
test('exact duplicate is acknowledged without second transition',()=>{
  assert.equal(run({}, {}, {'S-1':submission}).status,'duplicate');
});
test('duplicate ID with different content conflicts',()=>{
  assert.equal(run({limitations:['new']}, {}, {'S-1':submission}).status,'rejected');
});
test('does not mutate authority or receipts',()=>{
  const before=JSON.stringify(grant); run(); assert.equal(JSON.stringify(grant),before);
});
test('known duplicate remains duplicate after reassignment',()=>assert.equal(run({}, {generation:3}, {'S-1':submission}).status,'duplicate'));
test('external artifact still requires verification',()=>assert.equal(run().artifactVerification,'required'));
