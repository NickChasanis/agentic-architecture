import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runVerification} from './verify-all.mjs';
const temp=()=>mkdtempSync(join(tmpdir(),'verify-all-'));
test('portable command runs before build',async()=>{const events=[];await runVerification({cwd:temp(),commands:[[async()=>events.push('portable'),[]],[async()=>events.push('build'),[]]]});assert.deepEqual(events,['portable','build']);});
test('portable failure stops later commands',async()=>{const events=[];await assert.rejects(runVerification({cwd:temp(),commands:[[async()=>{events.push('portable');throw new Error('portable failed');},[]],[async()=>events.push('build'),[]]]}),/portable failed/);assert.deepEqual(events,['portable']);});
