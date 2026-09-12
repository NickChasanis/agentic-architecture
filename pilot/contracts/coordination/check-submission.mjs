import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
const schema=JSON.parse(readFileSync(new URL('./work.schema.json',import.meta.url)));
const ajv=addFormats(new Ajv({coerceTypes:false,removeAdditional:false}));
const validGrant=ajv.compile(schema.definitions.grant);
const validSubmission=ajv.compile(schema.definitions.submission);
const safePath=p=>!p.startsWith('/') && !p.includes('\\') && p.split('/').every(x=>x!=='.'&&x!=='..') && !p.includes('//');
export function checkSubmission(s,g,receipts={}) {
  const reject=reason=>({status:'rejected',reason});
  if(!validGrant(g)||!validSubmission(s))return reject('invalid-envelope');
  if(s.artifactLocation!=='git:'+s.artifactRevision)return reject('artifact-location');
  if(Object.hasOwn(receipts,s.submissionId))return isDeepStrictEqual(receipts[s.submissionId],s)?{status:'duplicate'}:reject('duplicate-conflict');
  for(const key of ['taskId','workerId','generation','packetRevision','contracts','baseline'])
    if(!isDeepStrictEqual(s[key],g[key]))return reject(key);
  if(g.state!=='running')return reject('not-running');
  if(s.recordVersion>g.recordVersion)return reject('future-record');
  if(s.changedPaths.some(p=>!safePath(p)||!g.ownedPaths.some(root=>safePath(root)&&(root.endsWith('/')?p.startsWith(root):p===root))))return reject('path-ownership');
  if(s.unrunChecks.length)return reject('unrun-checks');
  if(s.checks.some(c=>c.testedRevision!==s.artifactRevision||c.outcome!=='pass'||Date.parse(c.startedAt)>Date.parse(c.endedAt)))return reject('check-evidence');
  if(g.requiredObligations.some(id=>!s.checks.some(c=>c.obligation===id)))return reject('missing-checks');
  if(s.recordVersion<g.recordVersion)return {status:'needs-revalidation'};
  return {status:'accepted-for-review',artifactVerification:'required'};
}
