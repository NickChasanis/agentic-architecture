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
 const input=notes();assert.deepEqual(selectByTag(input,'purple'),[input[0],input[1]]);assert.deepEqual(selectByTag(input,''),[input[3]]);assert.deepEqual(selectByTag(input,'pur'),[]);assert.deepEqual(selectByTag([],'purple'),[]);
});
test('EXT-002 rejects non-string tags',()=>{for(const tag of [null,undefined,1,{},[]])assert.throws(()=>selectByTag(notes(),tag));});
test('EXT-002 validates all records and duplicate IDs',()=>{const base=notes()[0];const invalid=[null,{},[],{...base,id:''},{...base,id:1},{...base,title:1},{...base,archived:'false'},{...base,tags:'purple'},{...base,tags:[1]},[base,{...base}],[{...base,archived:true,tags:[1]}]];for(const input of invalid)assert.throws(()=>selectByTag(input,'purple'));});
test('EXT-002 preserves caller input including nested tags',()=>{const input=notes(),before=structuredClone(input);selectByTag(input,'purple');assert.deepEqual(input,before);});
