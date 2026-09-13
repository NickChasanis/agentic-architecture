import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import pg from 'pg';
import {createApp} from '../../apps/api/app.js';
import {Identity} from '../../modules/identity-tenancy/service.js';
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url),'utf8'));
test('PAGE-01–06 real catalog pages preserve access and full-list compatibility',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl}),app=await createApp({config,pool}),identity=new Identity(pool);
 const login=async(name:string)=>identity.establish(config.issuer,config.users.find((u:any)=>u.username===name).id);
 const owner=await login('owner'),staff=await login('staff');const h={cookie:'__Host-pilot-session='+owner.id,origin:config.origin,'x-csrf-token':owner.csrf};
 let shop:string|undefined;const tenant='10000000-0000-4000-8000-000000000001';
 t.after(async()=>{if(shop){await pool.query('DELETE FROM catalog.products WHERE shop_id=$1',[shop]);await pool.query('DELETE FROM shops.shops WHERE id=$1',[shop]);}await app.close();await pool.end();});
 const r=await app.inject({method:'POST',url:'/api/v1/merchant/tenants/'+tenant+'/shops',headers:h,payload:{name:'Page fixture',slug:'page-'+randomUUID()}});assert.equal(r.statusCode,201);shop=r.json().id;
 const base='/api/v1/merchant/shops/'+shop+'/products',page=base+'/page';
 const get=(q='',headers=h)=>app.inject({url:page+q,headers});
 await t.test('PAGE-01 empty static page route takes precedence over product ID',async()=>{
  const r=await get();assert.equal(r.statusCode,200);assert.deepEqual(r.json(),{items:[],nextCursor:null});
 });
 await pool.query(`INSERT INTO catalog.products(id,tenant_id,shop_id,status,title,description,amount_minor,currency,published_at)
 SELECT md5($1::text || n)::uuid,$2::uuid,$1::uuid,CASE WHEN n%2=0 THEN 'draft' ELSE 'published' END,'Page item '||n,'',n,'EUR',CASE WHEN n%2=1 THEN now() ELSE NULL END FROM generate_series(1,1000) n`,[shop,tenant]);
 await t.test('PAGE-02 limits, final pages and static enumeration match legacy endpoint',async()=>{
  for(const state of ['', 'draft','published']){
   const query=state?'?status='+state:'';
   const full=await app.inject({url:base+query,headers:h});assert.equal(full.statusCode,200);assert.equal(full.json().items.length,state?500:1000);
   const ids:string[]=[];let cursor:string|null=null;let loops=0;
   do {const params=new URLSearchParams({limit:'100',...(state?{status:state}:{}),...(cursor?{cursor}: {})});const r=await get('?'+params);assert.equal(r.statusCode,200);assert.ok(r.json().items.length<=100);ids.push(...r.json().items.map((x:any)=>x.id));cursor=r.json().nextCursor;assert.ok(++loops<=11);}while(cursor);
   assert.deepEqual(ids,full.json().items.map((x:any)=>x.id));assert.equal(new Set(ids).size,ids.length);
  }
  const first=await get();assert.equal(first.json().items.length,25);assert.ok(first.json().nextCursor);
  assert.equal((await get('?limit=1')).json().items.length,1);
 });
 await t.test('PAGE-03 invalid query/cursor/context rejected',async()=>{
  for(const q of ['limit=0','limit=101','limit=01','limit=1.0','limit=-1','limit=2&limit=3','limit=1e2','status=all','unknown=x','cursor=','cursor=@@','cursor=eyJ2IjoxfQ']){const r=await get('?'+q);assert.equal(r.statusCode,400,q);}
  const draft=(await get('?status=draft&limit=1')).json();assert.ok(draft.nextCursor);
  assert.equal((await get('?status=published&cursor='+draft.nextCursor)).statusCode,400);
  const foreign=Buffer.from(JSON.stringify({v:1,shop:randomUUID(),status:'draft',after:draft.items[0].id})).toString('base64url');assert.equal((await get('?status=draft&cursor='+foreign)).statusCode,400);
 });
 await t.test('PAGE-04 authentication and authorization are checked for every page',async()=>{
  assert.equal((await app.inject(page)).statusCode,401);
  assert.equal((await get('',{...h,cookie:'__Host-pilot-session='+staff.id})).statusCode,404);
  const other=await login('outsider');assert.equal((await get('',{...h,cookie:'__Host-pilot-session='+other.id})).statusCode,404);
  const first=(await get('?limit=1')).json();await pool.query('UPDATE identity.memberships SET active=false WHERE principal_id=$1 AND tenant_id=$2',[owner.principalId,tenant]);
  try{assert.equal((await get('?cursor='+first.nextCursor)).statusCode,404);}finally{await pool.query('UPDATE identity.memberships SET active=true WHERE principal_id=$1 AND tenant_id=$2',[owner.principalId,tenant]);}
 });
 await t.test('PAGE-05 bounded responses with recorded query-plan evidence',async()=>{
  const start=performance.now(),r=await get('?limit=25');assert.equal(r.statusCode,200);assert.equal(r.json().items.length,25);assert.ok(Buffer.byteLength(r.body)<20000);
  const plan=await pool.query('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id FROM catalog.products WHERE shop_id=$1 ORDER BY id LIMIT 26',[shop]);
  console.log(JSON.stringify({fixtureRows:1000,pageSize:25,responseBytes:Buffer.byteLength(r.body),elapsedMs:performance.now()-start,queryPlan:plan.rows[0]['QUERY PLAN']}));
 });
});
