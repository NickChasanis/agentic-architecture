import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectByTag} from './src/select-by-tag.mjs';
const notes=()=>[
 {id:'one',title:'First',archived:false,tags:['purple','neon']},
 {id:'two',title:'Second',archived:false,tags:['purple','purple']},
 {id:'three',title:'Archived',archived:true,tags:['purple']},
 {id:'four',title:'Empty',archived:false,tags:['']},
];
test('EXT-002 selects exact active tags in stable order and preserves identity',()=>{
 const input=notes(), result=selectByTag(input,'purple');
 assert.deepEqual(result,[input[0],input[1]]);
 assert.strictEqual(result[0],input[0]);assert.strictEqual(result[1],input[1]);
 assert.deepEqual(selectByTag(input,''),[input[3]]);assert.deepEqual(selectByTag(input,'pur'),[]);
 assert.deepEqual(selectByTag(input,'Purple'),[]);assert.deepEqual(selectByTag([],'purple'),[]);
});
test('EXT-002 rejects non-string tags',()=>{for(const tag of [null,undefined,1,{},[]])assert.throws(()=>selectByTag(notes(),tag));});
test('EXT-002 validates active and archived records including nonmatches',()=>{
 const base=notes()[0];
 for(const input of [null,{},'notes',1])assert.throws(()=>selectByTag(input,'purple'));
 for(const archived of [false,true])for(const patch of [{id:''},{id:1},{title:1},{archived:'false'},{tags:'purple'},{tags:[1]},{tags:[null]}])
   assert.throws(()=>selectByTag([{...base,archived,...patch}],'missing'));
 for(const record of [null,{},[]])assert.throws(()=>selectByTag([record],'purple'));
});
test('EXT-002 preserves caller input including nested tags',()=>{const input=notes(),before=structuredClone(input);selectByTag(input,'purple');assert.deepEqual(input,before);});
test('EXT-002 rejects duplicate IDs even when the duplicate is archived',()=>{
 const base=notes()[0];for(const archived of [false,true])assert.throws(()=>selectByTag([base,{...base,archived}],'missing'));
});
test('EXT-002 rejects sparse notes and sparse tag arrays',()=>{
 assert.throws(()=>selectByTag(new Array(1),'purple'));
 for(const archived of [false,true])assert.throws(()=>selectByTag([{...notes()[0],archived,tags:new Array(1)}],'purple'));
});
test('EXT-002 accepts frozen input and exact Unicode tags',()=>{
 const note=Object.freeze({id:'unicode',title:'',archived:false,tags:Object.freeze(['😀','é','e\u0301'])});
 const input=Object.freeze([note]);assert.strictEqual(selectByTag(input,'😀')[0],note);
 assert.strictEqual(selectByTag(input,'é')[0],note);assert.deepEqual(selectByTag(input,'É'),[]);
});
test('EXT-002 returns each large-input record once in original order',()=>{
 const input=Array.from({length:10000},(_,i)=>({id:String(i),title:'',archived:i%3===0,tags:['x','x']}));
 const result=selectByTag(input,'x'),expected=input.filter(n=>!n.archived);
 assert.equal(result.length,expected.length);result.forEach((n,i)=>assert.strictEqual(n,expected[i]));
});
