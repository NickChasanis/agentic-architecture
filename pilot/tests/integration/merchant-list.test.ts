import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {createApp} from '../../apps/api/app.js';
import {Identity} from '../../modules/identity-tenancy/service.js';
import {validate,type Product} from '../../apps/merchant-admin/src/contracts.js';
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url),'utf8'));
test('MC-01–05/08 merchant catalog contract with real storage and separate response consumer',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const identity=new Identity(pool),app=await createApp({config,pool});
 t.after(async()=>{await app.close();await pool.end();});
 const login=async(name:string)=>identity.establish(config.issuer,config.users.find((u:any)=>u.username===name).id);
 const owner=await login('owner'),staff=await login('staff'),ungranted=await login('ungranted'),outsider=await login('outsider');
 const h=(s:typeof owner)=>({cookie:'__Host-pilot-session='+s.id,origin:config.origin,'x-csrf-token':s.csrf});
 const shop='20000000-0000-4000-8000-000000000001';
 const base='/api/v1/merchant/shops/'+shop+'/products';
 const get=(s:typeof owner,url=base)=>app.inject({url,headers:h(s)});
 const create=async(title:string)=>{
  const r=await app.inject({method:'POST',url:base,headers:h(owner),payload:{title,description:'',price:{amountMinor:0,currency:'EUR'}}});
  assert.equal(r.statusCode,201);return r.json();
 };
 const draft=await create('List draft'),published=await create('List published');
 assert.equal((await app.inject({method:'POST',url:base+'/'+published.id+'/publish',headers:h(owner),payload:{}})).statusCode,200);
 await t.test('MC-01/03/05 authorized list and inclusive state filters',async()=>{
  for(const s of [owner,staff]){
   const r=await get(s);assert.equal(r.statusCode,200);
   const {items}=validate<{items:Product[]}>('MerchantProductList',r.json());
   assert.ok(items.some(p=>p.id===draft.id));assert.ok(items.some(p=>p.id===published.id));
   assert.ok(items.every(p=>p.shopId===shop));assert.deepEqual(items.map(p=>p.id),items.map(p=>p.id).sort());
   assert.equal(items.find(p=>p.id===draft.id)!.price.amountMinor,0);
   for(const state of ['draft','published']){
    const filtered=await get(s,base+'?status='+state);assert.equal(filtered.statusCode,200);
    assert.ok(filtered.json().items.length);assert.ok(filtered.json().items.every((p:Product)=>p.status===state));
   }
  }
 });
 await t.test('MC-01 empty authorized shop succeeds',async()=>{
  const r=await app.inject({method:'POST',url:'/api/v1/merchant/tenants/10000000-0000-4000-8000-000000000001/shops',headers:h(owner),payload:{name:'Empty list',slug:'list-'+randomUUID()}});
  assert.equal(r.statusCode,201);
  const list=await get(owner,'/api/v1/merchant/shops/'+r.json().id+'/products');
  assert.equal(list.statusCode,200);assert.deepEqual(list.json(),{items:[]});
 });
 await t.test('MC-02 missing session, inaccessible and nonexistent shops',async()=>{
  assert.equal((await app.inject(base)).statusCode,401);
  const missing=await get(owner,'/api/v1/merchant/shops/'+randomUUID()+'/products');
  assert.equal(missing.statusCode,404);
  for(const [s,url] of [[ungranted,base],[outsider,base],[staff,base.replace(shop,'20000000-0000-4000-8000-000000000002')],[owner,base.replace(shop,'20000000-0000-4000-8000-000000000003')]] as const){
   const denied=await get(s,url);assert.equal(denied.statusCode,404);assert.deepEqual(denied.json(),missing.json());
  }
 });
 await t.test('MC-02 committed grant revocation applies to next list',async()=>{
  await pool.query('UPDATE identity.grants SET active=false WHERE principal_id=$1',[staff.principalId]);
  try{assert.equal((await get(staff)).statusCode,404);}
  finally{await pool.query('UPDATE identity.grants SET active=true WHERE principal_id=$1',[staff.principalId]);}
 });
 await t.test('MC-03 invalid, repeated and unknown query fields rejected',async()=>{
  for(const q of ['status=all','status=','status=draft&status=published','page=1','status=draft&tenantId=anything']){
   const r=await get(owner,base+'?'+q);assert.equal(r.statusCode,400);assert.equal(r.json().error.code,'VALIDATION_FAILED');
  }
 });
 await t.test('MC-04 public privacy and immutable publication remain intact',async()=>{
  const publicList=await app.inject('/api/v1/public/shops/shop-a1/products');
  assert.equal(publicList.statusCode,200);assert.ok(!publicList.json().items.some((p:any)=>p.id===draft.id));
  for(const p of publicList.json().items)assert.deepEqual(Object.keys(p).sort(),['description','id','price','title']);
  const edit=await app.inject({method:'PUT',url:base+'/'+published.id,headers:h(owner),payload:{title:'Change',description:'',price:{amountMinor:0,currency:'EUR'}}});
  assert.equal(edit.statusCode,409);
 });
 await t.test('MC-08 test-only state counter consumes wire response without storage access',async()=>{
  const countStates=(payload:unknown)=>validate<{items:Product[]}>('MerchantProductList',payload).items.reduce((counts,p)=>({...counts,[p.status]:counts[p.status]+1}),{draft:0,published:0});
  const all=(await get(owner)).json();const counts=countStates(all);
  assert.equal(counts.draft,(await get(owner,base+'?status=draft')).json().items.length);
  assert.equal(counts.published,(await get(owner,base+'?status=published')).json().items.length);
  assert.throws(()=>countStates({items:[{...draft,status:'private'}]}),/contract mismatch/);
 });
});
