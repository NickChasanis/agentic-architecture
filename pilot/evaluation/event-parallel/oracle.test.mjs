import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
if (!process.env.PAR_IMPLEMENTATION) throw new Error('PAR_IMPLEMENTATION must name the assigned solution');
const {aggregateActive, countRemovals} = await import(pathToFileURL(process.env.PAR_IMPLEMENTATION));
const e=(id,version,removed=false,owner='A')=>({id,version,removed,owner});

test('PAR-01 greatest version wins, equal version uses FIRST',()=>{
 const a=e('a',3),b=e('a',2),c=e('b',1),d=e('b',1,false,'B');
 assert.deepEqual(aggregateActive([a,b,c,d]),[a,c]);
});
test('PAR-02 first-seen ID order survives winner position and removal',()=>{
 const a=e('a',1),b=e('b',2),c=e('c',1),d=e('a',3),r=e('b',3,true);
 assert.deepEqual(aggregateActive([a,b,c,d,r]),[d,c]);
});
test('PAR-03 tombstones may be superseded; first-on-tie tombstone removes',()=>{
 const a=e('a',1,true),b=e('a',2),d=e('b',1,true),c=e('b',1);
 assert.deepEqual(aggregateActive([a,b,d,c]),[b]);
});
test('PAR-04 empty input returns fresh structures',()=>{
 const input=[];assert.deepEqual(aggregateActive(input),[]);assert.notStrictEqual(aggregateActive(input),input);assert.deepEqual(countRemovals(input),{});
});
test('PAR-05 removals count includes superseded and removed events',()=>{
 const r1=e('a',1,true,'B'),r2=e('a',2,false,'B'),r3=e('b',1,true,'A'),r4=e('c',1,true,'B');
 assert.deepEqual(countRemovals([r1,r2,r3,r4]),{B:2,A:1});
});
test('PAR-06 literal object-like owner keys',()=>{
 const expected={};Object.defineProperty(expected,'__proto__',{value:1,enumerable:true,writable:true,configurable:true});expected.constructor=1;
 assert.deepEqual(countRemovals([e('a',1,true,'__proto__'),e('b',1,true,'constructor')]),expected);
});
for(const [name,fn] of Object.entries({aggregateActive,countRemovals})){
 test('PAR-07 '+name+' rejects malformed outer and nested input',()=>{
  for(const input of [null,{},1,'events',new Array(1),[null],[[]],[{}]])assert.throws(()=>fn(input),TypeError);
  for(const patch of [{id:''},{id:1},{version:0},{version:-1},{version:1.5},{version:NaN},{version:Infinity},{version:Number.MAX_SAFE_INTEGER+1},{removed:0},{owner:null}])
    assert.throws(()=>fn([e('good',1),{...e('bad',1),...patch}]),TypeError);
 });
 test('PAR-08 '+name+' validates superseded and removed events',()=>{
  assert.throws(()=>fn([{...e('a',1),owner:5},e('a',2)]),TypeError);
  assert.throws(()=>fn([{...e('a',1,true),owner:5}]),TypeError);
 });
 test('PAR-09 '+name+' supports frozen caller data without mutation',()=>{
  const input=Object.freeze([Object.freeze(e('a',1)),Object.freeze(e('a',2)),Object.freeze(e('b',1,true))]);
  const before=structuredClone(input);fn(input);assert.deepEqual(input,before);
 });
}
for(const [name,fn] of Object.entries({aggregateActive,countRemovals})){
 test('PAR-10 '+name+' handles large input without spreading',()=>{
  const input=Array.from({length:20000},(_,i)=>e(String(i%1000),Math.floor(i/1000)+1,i<19000&&i%7===0,String(i%5)));
  if(fn===aggregateActive){const r=fn(input);assert.equal(r.length,1000);}
  else {const r=fn(input);assert.equal(r['1'],543);}
 });
}