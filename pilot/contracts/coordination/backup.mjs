import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const schema=JSON.parse(readFileSync(new URL('./work.schema.json',import.meta.url)));
const ajv=addFormats(new Ajv());
const validGrant=ajv.compile(schema.definitions.grant);
const validSubmission=ajv.compile(schema.definitions.submission);
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
const safeInt=n=>Number.isSafeInteger(n)&&n>=0;

// Backup contains protocol records, never database credentials. Its checksum
// detects accidental corruption; it is not a signature or authority transfer.
export async function exportNamespace(pool,namespace) {
  const c=await pool.connect();
  try {
    await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const state=(await c.query('SELECT schema_version,revision,event_sequence FROM coordination.namespaces WHERE namespace_id=$1',[namespace])).rows[0];
    if(!state || state.schema_version!==1) throw Error('unknown-or-unsupported-namespace');
    const grants=(await c.query('SELECT record FROM coordination.grants WHERE namespace_id=$1 ORDER BY task_id',[namespace])).rows.map(r=>r.record);
    const receipts=(await c.query('SELECT submission_id,submission,result FROM coordination.receipts WHERE namespace_id=$1 ORDER BY submission_id',[namespace])).rows;
    const events=(await c.query('SELECT sequence,type,at,payload FROM coordination.events WHERE namespace_id=$1 ORDER BY sequence',[namespace])).rows.map(r=>({...r,sequence:Number(r.sequence),at:new Date(r.at).toISOString()}));
    const data={namespace,schemaVersion:state.schema_version,revision:Number(state.revision),eventSequence:Number(state.event_sequence),grants,receipts,events};
    const backup={formatVersion:1,createdAt:new Date().toISOString(),sha256:digest(data),data};
    validateBackup(backup);
    await c.query('COMMIT');
    return backup;
  } catch(e) {await c.query('ROLLBACK').catch(()=>{});throw e;} finally {c.release();}
}

export function validateBackup(backup) {
  const d=backup?.data;
  if(backup?.formatVersion!==1 || !d || backup.sha256!==digest(d)) throw Error('invalid-backup-checksum');
  if(d.schemaVersion!==1 || !safeInt(d.revision) || !safeInt(d.eventSequence) ||
     typeof d.namespace!=='string' || !d.namespace || !Array.isArray(d.grants) || !Array.isArray(d.receipts) || !Array.isArray(d.events)) throw Error('invalid-backup-state');
  if(d.eventSequence!==d.events.length || d.revision!==d.eventSequence ||
     d.events.some((e,i)=>e.sequence!==i+1 || !['grant','submission','termination-confirmed'].includes(e.type) || !Number.isFinite(Date.parse(e.at)))) throw Error('invalid-backup-events');
  if(new Set(d.grants.map(g=>g.taskId)).size!==d.grants.length || d.grants.some(g=>!validGrant(g))) throw Error('invalid-backup-grants');
  if(new Set(d.receipts.map(r=>r.submission_id)).size!==d.receipts.length ||
     d.receipts.some(r=>!validSubmission(r.submission) || r.submission_id!==r.submission.submissionId || r.result?.status!=='accepted-for-review' || !d.grants.some(g=>g.taskId===r.submission.taskId))) throw Error('invalid-backup-receipts');
  return d;
}

export async function restoreNamespace(pool,backup,destination) {
  const d=validateBackup(backup);
  if(typeof destination!=='string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(destination) || destination===d.namespace) throw Error('new-destination-required');
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[destination]);
    // A plain INSERT prevents overwriting an existing namespace, even empty.
    await c.query('INSERT INTO coordination.namespaces VALUES($1,$2,$3,$4)',[destination,d.schemaVersion,d.revision,d.eventSequence]);
    for(const g of d.grants) await c.query('INSERT INTO coordination.grants VALUES($1,$2,$3)',[destination,g.taskId,g]);
    for(const r of d.receipts) await c.query('INSERT INTO coordination.receipts VALUES($1,$2,$3,$4)',[destination,r.submission_id,r.submission,r.result]);
    for(const e of d.events) await c.query('INSERT INTO coordination.events VALUES($1,$2,$3,$4,$5)',[destination,e.sequence,e.type,e.at,e.payload]);
    await c.query('COMMIT');
    return {namespace:destination,revision:d.revision,authority:'not-transferred',reconciliationRequired:true};
  } catch(e) {await c.query('ROLLBACK').catch(()=>{});throw e;} finally {c.release();}
}
