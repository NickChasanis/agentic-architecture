import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import pg from 'pg';
import {createApp} from '../../apps/api/app.js';
import {Identity} from '../../modules/identity-tenancy/service.js';
import {renderPublicCatalogCard} from '../../modules/storefront/public-catalog.js';
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url),'utf8'));
const shop='20000000-0000-4000-8000-000000000001';
test('catalog publication contract: draft, edit, publish, public view and immutable edit',async()=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const identity=new Identity(pool), owner=await identity.establish(config.issuer,config.users[0].id);
 const app=await createApp({config,pool}); const h={cookie:'__Host-pilot-session='+owner.id,origin:config.origin,'x-csrf-token':owner.csrf};
 const draft={title:' Purple notebook ',description:'plain text',price:{amountMinor:1250,currency:'EUR'}};
 try{
  const created=await app.inject({method:'POST',url:'/api/v1/merchant/shops/'+shop+'/products',headers:h,payload:draft});
  assert.equal(created.statusCode,201);const product=created.json();assert.equal(product.status,'draft');assert.equal(product.title,'Purple notebook');
  assert.deepEqual((await app.inject({url:'/api/v1/merchant/shops/'+shop+'/products/'+product.id,headers:h})).json(),product);
  const edited=await app.inject({method:'PUT',url:'/api/v1/merchant/shops/'+shop+'/products/'+product.id,headers:h,payload:{...draft,title:'Updated'}});
  assert.equal(edited.statusCode,200);assert.equal(edited.json().title,'Updated');
  const published=await app.inject({method:'POST',url:'/api/v1/merchant/shops/'+shop+'/products/'+product.id+'/publish',headers:h,payload:{}});
  assert.equal(published.statusCode,200);assert.equal(published.json().status,'published');
  const repeated=await app.inject({method:'POST',url:'/api/v1/merchant/shops/'+shop+'/products/'+product.id+'/publish',headers:h,payload:{}});
  assert.equal(repeated.statusCode,200);assert.equal(repeated.json().id,product.id);
  const immutable=await app.inject({method:'PUT',url:'/api/v1/merchant/shops/'+shop+'/products/'+product.id,headers:h,payload:{...draft,title:'illegal'}});
  assert.equal(immutable.statusCode,409);assert.equal(immutable.json().error.code,'PRODUCT_IMMUTABLE');
  const list=await app.inject({url:'/api/v1/public/shops/shop-a1/products'});assert.equal(list.statusCode,200);
  assert.equal(list.json().items.some((p:any)=>p.id===product.id),true);
  const card=renderPublicCatalogCard(list.json().items.find((p:any)=>p.id===product.id));
  assert.deepEqual(card,{id:product.id,title:'Updated',description:'plain text',price:'€12.50'});
  const detail=await app.inject({url:'/api/v1/public/shops/shop-a1/products/'+product.id});
  assert.equal(detail.statusCode,200);assert.deepEqual(Object.keys(detail.json()).sort(),['description','id','price','title']);
  assert.equal((await app.inject({url:'/api/v1/public/shops/shop-b1/products/'+product.id})).statusCode,404);
 }finally{await app.close();await pool.end();}
});
test('competing publishes are idempotent and use one row lock',async()=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});const identity=new Identity(pool);
 const owner=await identity.establish(config.issuer,config.users[0].id),app=await createApp({config,pool});
 const h={cookie:'__Host-pilot-session='+owner.id,origin:config.origin,'x-csrf-token':owner.csrf};
 try{
  const r=await app.inject({method:'POST',url:'/api/v1/merchant/shops/'+shop+'/products',headers:h,payload:{title:'Race',description:'',price:{amountMinor:1,currency:'EUR'}}});
  const id=r.json().id;const publishes=await Promise.all([1,2].map(()=>app.inject({method:'POST',url:'/api/v1/merchant/shops/'+shop+'/products/'+id+'/publish',headers:h,payload:{}})));
  assert.deepEqual(publishes.map(x=>x.statusCode),[200,200]);assert.equal(new Set(publishes.map(x=>x.json().id)).size,1);
 }finally{await app.close();await pool.end();}
});
test('public routes never expose draft or merchant fields',async()=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});const app=await createApp({config,pool});
 try{const r=await app.inject('/api/v1/public/shops/shop-a1/products');assert.equal(r.statusCode,200);for(const item of r.json().items)assert.deepEqual(Object.keys(item).sort(),['description','id','price','title']);}
 finally{await app.close();await pool.end();}
});
