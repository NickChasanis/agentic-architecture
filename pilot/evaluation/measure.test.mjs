import {test} from 'node:test';
import assert from 'node:assert/strict';
import {measure} from './measure.mjs';
test('zero observations are unmeasured',()=>assert.equal(measure({required:[],checks:[],declaredPaths:[],changedPaths:[]}).conformance,'not-measured'));
test('a pass cannot mask an unresolved failure',()=>assert.equal(measure({required:['A'],checks:[{obligation:'A',outcome:'pass'},{obligation:'A',outcome:'fail'}],declaredPaths:[],changedPaths:[]}).conformance,'fail'));
test('measurement reports contract coverage and extension surface',()=>{const r=measure({required:['A','B'],checks:[{obligation:'A',outcome:'pass'},{obligation:'B',outcome:'pass'}],declaredPaths:['pilot/modules/catalog'],changedPaths:['pilot/modules/storefront/public-catalog.ts'],breakingChanges:0,minutes:12,cost:null});assert.deepEqual(r,{coverage:1,conformance:'pass',outsideBoundary:1,breakingChanges:0,minutes:12,cost:'unavailable'});});
test('missing mandatory evidence cannot pass',()=>assert.equal(measure({required:['A'],checks:[],declaredPaths:[],changedPaths:[],breakingChanges:0,minutes:1,cost:null}).conformance,'fail'));
