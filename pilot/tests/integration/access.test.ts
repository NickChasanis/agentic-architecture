import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {createApp} from '../../apps/api/app.js';
import {Identity,hash} from '../../modules/identity-tenancy/service.js';
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url),'utf8'));
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
test('real database foundation contract matrix (injected identity setup, not login proof)',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 let time=new Date();
 const identity=new Identity(pool,()=>time),app=await createApp({config,pool,now:()=>time});
 t.after(async()=>{await app.close();await pool.end();});
 const login=async(name:string)=>identity.establish(config.issuer,config.users.find((u:any)=>u.username===name).id);
 const owner=await login('owner'),staff=await login('staff'),ungranted=await login('ungranted'),empty=await login('empty'),outsider=await login('outsider');
 const headers=(s:typeof owner)=>({cookie:'__Host-pilot-session='+s.id,origin:config.origin,'x-csrf-token':s.csrf});
 const get=(s:typeof owner,url:string)=>app.inject({url,headers:headers(s)});
 const create=(s:typeof owner,tenant=a,body:any={name:'  Test shop  ',slug:'test-'+randomUUID()})=>
  app.inject({method:'POST',url:'/api/v1/merchant/tenants/'+tenant+'/shops',headers:headers(s),payload:body});
 await t.test('owner/staff/ungranted/empty/outsider discovery',async()=>{
  assert.equal((await get(owner,'/api/v1/merchant/tenants')).json().items[0].canCreateShop,true);
  assert.deepEqual((await get(empty,'/api/v1/merchant/tenants')).json(),{items:[]});
  assert.equal((await get(staff,'/api/v1/merchant/tenants/'+a+'/shops')).json().items.length,1);
  assert.deepEqual((await get(ungranted,'/api/v1/merchant/tenants/'+a+'/shops')).json(),{items:[]});
  assert.equal((await get(outsider,'/api/v1/merchant/tenants/'+b+'/shops')).statusCode,200);
 });
 await t.test('missing and inaccessible tenant are identical',async()=>{
  const denied=await get(owner,'/api/v1/merchant/tenants/'+b+'/shops');
  const missing=await get(owner,'/api/v1/merchant/tenants/'+randomUUID()+'/shops');
  assert.equal(denied.statusCode,404);assert.equal(missing.statusCode,404);assert.deepEqual(denied.json(),missing.json());
 });
 await t.test('owner creates normalized shop; staff/cross-tenant denied without writes',async()=>{
  const good=await create(owner);assert.equal(good.statusCode,201);assert.equal(good.json().name,'Test shop');
  const before=await pool.query('SELECT count(*) FROM shops.shops');
  assert.equal((await create(staff)).statusCode,404);assert.equal((await create(owner,b)).statusCode,404);
  assert.deepEqual((await pool.query('SELECT count(*) FROM shops.shops')).rows,before.rows);
 });
 await t.test('slug conflict generic; strict body validation',async()=>{
  const slug='unique-'+randomUUID();assert.equal((await create(owner,a,{name:'Shop',slug})).statusCode,201);
  const clash=await create(owner,a,{name:'Shop',slug});assert.equal(clash.statusCode,409);assert.equal(clash.json().error.code,'SLUG_UNAVAILABLE');
  assert.equal((await create(owner,a,{name:'Shop',slug:'other',tenantId:b})).statusCode,400);
 });
 await t.test('bad CSRF or origin cannot mutate persisted shops',async()=>{
  const before=await pool.query('SELECT count(*) FROM shops.shops');
  for(const h of [{...headers(owner),'x-csrf-token':'bad'},{...headers(owner),origin:'https://evil.invalid'},
    {cookie:headers(owner).cookie}]){
   const r=await app.inject({method:'POST',url:'/api/v1/merchant/tenants/'+a+'/shops',headers:h,payload:{name:'Bad',slug:'bad-shop'}});
   assert.equal(r.statusCode,403);
  }
  assert.deepEqual((await pool.query('SELECT count(*) FROM shops.shops')).rows,before.rows);
 });
 await t.test('committed grant and membership revocation takes effect on next check',async()=>{
  await pool.query('UPDATE identity.grants SET active=false WHERE principal_id=$1',[staff.principalId]);
  try{assert.deepEqual((await get(staff,'/api/v1/merchant/tenants/'+a+'/shops')).json(),{items:[]});}
  finally{await pool.query('UPDATE identity.grants SET active=true WHERE principal_id=$1',[staff.principalId]);}
  await pool.query('UPDATE identity.memberships SET active=false WHERE principal_id=$1',[staff.principalId]);
  try{assert.equal((await get(staff,'/api/v1/merchant/tenants/'+a+'/shops')).statusCode,404);}
  finally{await pool.query('UPDATE identity.memberships SET active=true WHERE principal_id=$1',[staff.principalId]);}
 });
 await t.test('disabled principal denied even with existing session',async()=>{
  await pool.query('UPDATE identity.principals SET active=false WHERE id=$1',[owner.principalId]);
  try{assert.equal((await get(owner,'/api/v1/auth/session')).statusCode,401);}
  finally{await pool.query('UPDATE identity.principals SET active=true WHERE id=$1',[owner.principalId]);}
  await assert.rejects(login('disabled'),{code:'ACCOUNT_UNAVAILABLE'});
 });
 await t.test('rotation revokes only same-browser session and rotates CSRF',async()=>{
  const other=await login('owner'),rotated=await identity.establish(config.issuer,owner.principalId,owner.id);
  assert.notEqual(rotated.csrf,owner.csrf);assert.equal(await identity.authenticate(owner.id),null);
  assert.ok(await identity.authenticate(other.id));
 });
 await t.test('idle and absolute expiry enforced by server clock',async()=>{
  const s=await login('owner');time=new Date(time.getTime()+1800001);
  assert.equal(await identity.authenticate(s.id),null);
  const absolute=await login('owner');
  for(let i=0;i<16;i++){time=new Date(time.getTime()+1799999);await identity.authenticate(absolute.id);}
  time=new Date(time.getTime()+100);assert.equal(await identity.authenticate(absolute.id),null);
 });
 await t.test('logout clears cookie and invalidates session',async()=>{
  const s=await login('owner');
  const r=await app.inject({method:'POST',url:'/api/v1/auth/logout',headers:headers(s),payload:{}});
  assert.equal(r.statusCode,204);assert.equal(r.body,'');assert.ok(String(r.headers['set-cookie']).includes('Max-Age=0'));
  assert.equal((await get(s,'/api/v1/auth/session')).statusCode,401);
 });
 await t.test('single-use, superseded, expired and wrong-state transactions',async()=>{
  const first=await identity.startTransaction(),other=await identity.startTransaction();
  const second=await identity.startTransaction(first.binding);
  assert.equal(await identity.consumeTransaction(first.binding,first.state),null);
  assert.ok(await identity.consumeTransaction(second.binding,second.state));
  assert.equal(await identity.consumeTransaction(second.binding,second.state),null);
  assert.equal(await identity.consumeTransaction(other.binding,'wrong'),null);
  assert.equal(await identity.consumeTransaction(other.binding,other.state),null);
  const expired=await identity.startTransaction();time=new Date(time.getTime()+300001);
  assert.equal(await identity.consumeTransaction(expired.binding,expired.state),null);
 });
});
