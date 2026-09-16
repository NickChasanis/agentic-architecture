import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
if (!process.env.COHORT_IMPLEMENTATION) throw new Error('COHORT_IMPLEMENTATION must name the assigned solution');
const {latestActive, summarizeOwners} = await import(pathToFileURL(process.env.COHORT_IMPLEMENTATION));
const e=(id,version,removed=false,owner='A')=>({id,version,removed,owner});

test('EVENT-01 maximum version wins, equal version uses last event',()=>{
 const a=e('a',3),b=e('a',2),c=e('b',1),d=e('b',1,false,'B');
 const result=latestActive([a,b,c,d]);assert.deepEqual(result,[a,d]);assert.strictEqual(result[0],a);assert.strictEqual(result[1],d);
});
test('EVENT-02 first-seen ID order survives winner position and removal',()=>{
 const a=e('a',1),b=e('b',2),c=e('c',1),d=e('a',3),r=e('b',3,true);
 assert.deepEqual(latestActive([a,b,c,d,r]),[d,c]);
});
test('EVENT-03 tombstones may be superseded; tie tombstone removes',()=>{
 const a=e('a',1,true),b=e('a',2),c=e('b',1),d=e('b',1,true);
 assert.deepEqual(latestActive([a,b,c,d]),[b]);
});
test('EVENT-04 empty arrays and fresh return arrays',()=>{
 const input=[];assert.deepEqual(latestActive(input),[]);assert.notStrictEqual(latestActive(input),input);assert.deepEqual(summarizeOwners(input),[]);
});
test('EVENT-05 summaries count winning IDs, not historical events',()=>{
 assert.deepEqual(summarizeOwners([e('a',1,false,'old'),e('a',2,false,'B'),e('b',1,false,'B'),e('c',1,true,'C')]),[{owner:'B',count:2}]);
});
test('EVENT-06 code-point ordering and literal object-like owner keys',()=>{
 const owners=['😀','\uE000','a','A','','__proto__','constructor'];
 assert.deepEqual(summarizeOwners(owners.map((owner,i)=>e(String(i),1,false,owner))),['','A','__proto__','a','constructor','\uE000','😀'].map(owner=>({owner,count:1})));
});
for(const [name,fn] of Object.entries({latestActive,summarizeOwners})){
 test('EVENT-07 '+name+' rejects malformed outer and nested input',()=>{
  for(const input of [null,{},1,'events',new Array(1),[null],[[]],[{}]])assert.throws(()=>fn(input),TypeError);
  for(const patch of [{id:''},{id:1},{version:0},{version:-1},{version:1.5},{version:NaN},{version:Infinity},{version:Number.MAX_SAFE_INTEGER+1},{removed:0},{owner:null}])
    assert.throws(()=>fn([e('good',1),{...e('bad',1),...patch}]),TypeError);
 });
 test('EVENT-08 '+name+' validates superseded and removed events',()=>{
  assert.throws(()=>fn([{...e('a',1),owner:5},e('a',2)]),TypeError);
  assert.throws(()=>fn([{...e('a',1,true),owner:5}]),TypeError);
 });
 test('EVENT-09 '+name+' supports frozen caller data without mutation',()=>{
  const input=Object.freeze([Object.freeze(e('a',1)),Object.freeze(e('a',2)),Object.freeze(e('b',1,true))]);
  const before=structuredClone(input);fn(input);assert.deepEqual(input,before);
 });
}
test('EVENT-10 large input reduces linearly sized history and preserves identity',()=>{
 const input=Array.from({length:20000},(_,i)=>e(String(i%1000),Math.floor(i/1000)+1,false,String(i%5)));
 const result=latestActive(input);assert.equal(result.length,1000);result.forEach((item,i)=>assert.strictEqual(item,input[19000+i]));
 assert.deepEqual(summarizeOwners(input),Array.from({length:5},(_,i)=>({owner:String(i),count:200})));
});
