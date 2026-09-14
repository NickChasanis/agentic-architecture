import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterNotes} from './src/filter.mjs';
import {countTags} from './src/tags.mjs';

const notes=()=>[
 {id:'one',title:'First Purple Note',archived:false,tags:['neon','neon','alpha']},
 {id:'two',title:'Second note',archived:false,tags:['neon','']},
 {id:'three',title:'Purple archive',archived:true,tags:['hidden']},
];
test('NOTES-FILTER-01 title matching is case insensitive and excludes archived notes',()=>{
 const input=notes();
 assert.deepEqual(filterNotes(input,'PURPLE'),[input[0]]);
 assert.deepEqual(filterNotes(input,'note'),input.slice(0,2));
 assert.deepEqual(filterNotes(input,''),input.slice(0,2));
 assert.deepEqual(filterNotes(input,'missing'),[]);
 assert.deepEqual(filterNotes([],''),[]);
});
test('NOTES-FILTER-02 query type is strict',()=>{
 for(const q of [null,undefined,1,{},[]])assert.throws(()=>filterNotes(notes(),q));
});
test('NOTES-TAGS-01 per-note deduplication, archive exclusion and empty input',()=>{
 assert.deepEqual(countTags(notes()),[{tag:'',count:1},{tag:'alpha',count:1},{tag:'neon',count:2}]);
 assert.deepEqual(countTags([]),[]);
});
test('NOTES-TAGS-02 tags retain case and sort by Unicode code point',()=>{
 const input=[{id:'u',title:'unicode',archived:false,tags:['😀','\uE000','a','A','a']}];
 assert.deepEqual(countTags(input),[{tag:'A',count:1},{tag:'a',count:1},{tag:'\uE000',count:1},{tag:'😀',count:1}]);
});
for(const [label,fn] of [['filter',n=>filterNotes(n,'')],['tags',countTags]]) {
 test('NOTES-INPUT-01 '+label+' rejects malformed records and duplicate IDs',()=>{
   const invalid=[null,{},[null],[{}],[{...notes()[0],id:''}],[{...notes()[0],id:1}],
    [{...notes()[0],title:1}],[{...notes()[0],archived:'false'}],[{...notes()[0],tags:'tag'}],
    [{...notes()[0],tags:[1]}],[notes()[0],{...notes()[0]}]];
   for(const input of invalid)assert.throws(()=>fn(input));
 });
 test('NOTES-INPUT-02 '+label+' preserves caller input including nested tags',()=>{
   const input=notes(),before=structuredClone(input);
   fn(input);assert.deepEqual(input,before);
 });
}
