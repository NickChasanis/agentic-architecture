import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHarness} from './harness.mjs';
const url='/api/v1/merchant/shops/20000000-0000-4000-8000-000000000001/products';
test('merchant list manifest validates status query and response',async()=>{
 const app=createHarness({authenticate:async()=>true,handlers:{'HTTP-08':async()=>({body:{items:[]}})}});
 try{
  for(const query of ['','?status=draft','?status=published'])assert.equal((await app.inject(url+query)).statusCode,200);
  for(const query of ['?status=all','?page=1','?status=draft&status=published'])assert.equal((await app.inject(url+query)).statusCode,400);
 }finally{await app.close();}
});
test('merchant list requires authentication',async()=>{
 const app=createHarness();try{assert.equal((await app.inject(url)).statusCode,401);}finally{await app.close();}
});
