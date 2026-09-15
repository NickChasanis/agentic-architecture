import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const verifier=readFileSync(new URL('./verify-all.mjs',import.meta.url),'utf8');
test('offline verification invokes portable checks immediately before build',()=>{
 const portable=verifier.indexOf("['npm',['run','test:portable']]");
 const build=verifier.indexOf("['npm',['run','build:merchant']]");
 assert.ok(portable>=0); assert.ok(portable<build);
});
test('verification remains fail-fast around portable command',()=>{
 assert.match(verifier,/result\.status!==0/);
 assert.match(verifier,/process\.exit\(result\.status\|\|1\)/);
});
