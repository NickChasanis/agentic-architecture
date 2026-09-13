import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectProducts} from '../../modules/storefront/select-products.mjs';
import {summarizeProducts} from '../../modules/storefront/summarize-products.mjs';
const products=[
 {id:'b',title:'Neon Notebook',description:'',price:{amountMinor:1250,currency:'EUR'}},
 {id:'a',title:'Purple Lamp',description:'',price:{amountMinor:0,currency:'EUR'}},
 {id:'c',title:'NEON Poster',description:'',price:{amountMinor:1250,currency:'EUR'}}
];
test('EXT-01 query is trimmed case-insensitive title substring',()=>assert.deepEqual(selectProducts(products,{query:' NEON '}).map(p=>p.id),['b','c']));
test('EXT-02 inclusive price bounds preserve input order and zero',()=>assert.deepEqual(selectProducts(products,{minPrice:0,maxPrice:0}).map(p=>p.id),['a']));
test('EXT-03 selection returns a new array without input mutation',()=>{const frozen=Object.freeze(products.map(p=>Object.freeze({...p,price:Object.freeze({...p.price})})));assert.deepEqual(selectProducts(frozen),products);assert.notEqual(selectProducts(frozen),frozen);assert.deepEqual(selectProducts(frozen,{minPrice:1251}),[]);});
test('EXT-04 invalid bounds fail explicitly',()=>{for(const options of [{minPrice:-1},{maxPrice:1.2},{minPrice:2,maxPrice:1},{minPrice:NaN},{maxPrice:100000001}])assert.throws(()=>selectProducts(products,options),RangeError);});
test('EXT-05 summary uses integer minor units and preserves input',()=>{const before=structuredClone(products);assert.deepEqual(summarizeProducts(products),{count:3,minPrice:0,maxPrice:1250,currency:'EUR'});assert.deepEqual(products,before);});
test('EXT-06 empty summary has null bounds',()=>assert.deepEqual(summarizeProducts([]),{count:0,minPrice:null,maxPrice:null,currency:'EUR'}));
// Supplemental reviewer finding after both frozen trials; not retroactively
// included in the six-obligation first-submission score.
test('EXT-07 large catalog summary does not expand function arguments',()=>{
 const many=Array.from({length:200000},(_,i)=>({...products[0],price:{amountMinor:i%2,currency:'EUR'}}));
 assert.deepEqual(summarizeProducts(many),{count:200000,minPrice:0,maxPrice:1,currency:'EUR'});
});
