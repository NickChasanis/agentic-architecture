import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('.local/config.json','utf8'));
const listUrl=(url:string)=>/\/products(?:\/page)?(?:\?|$)/.test(new URL(url).pathname+new URL(url).search);
test('PAGE-06 real page navigation, restart and filter reset',async({page})=>{
 const f=await fixture(page);
 await page.evaluate(async shop=>{
  const session=await (await fetch('/api/v1/auth/session')).json();
  for(let i=0;i<26;i++){
   const r=await fetch('/api/v1/merchant/shops/'+shop+'/products',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrfToken},body:JSON.stringify({title:'Navigation '+i,description:'',price:{amountMinor:i,currency:'EUR'}})});if(!r.ok)throw new Error('fixture failed');
  }
 },f.shop.id);
 await page.getByLabel('Product shop').selectOption(f.empty.id);await page.getByLabel('Product shop').selectOption(f.shop.id);
 const rows=page.getByRole('list',{name:'Merchant products'}).getByRole('listitem');await expect(rows).toHaveCount(25);
 const first=await rows.allTextContents();await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(rows).toHaveCount(3);await expect(page.getByRole('button',{name:'Next page',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Restart list',exact:true}).click();await expect(rows).toHaveCount(25);expect(await rows.allTextContents()).toEqual(first);
 await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(rows).toHaveCount(3);
 await page.getByLabel('Product status').selectOption('published');await expect(rows).toHaveCount(1);await expect(rows).toContainText('Unique published');
});
async function fixture(page:Page){
 await page.goto('/');await page.getByRole('link',{name:'Sign in'}).click();
 const user=config.users.find((u:any)=>u.username==='owner');
 await page.locator('#username').fill(user.username);await page.locator('#password').fill(user.password);await page.locator('#kc-login').click();
 await page.waitForURL(url=>url.origin===config.origin&&url.pathname==='/');
 const seeded=await page.evaluate(async()=>{
  const session=await (await fetch('/api/v1/auth/session')).json();
  async function post(url:string,body:unknown){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrfToken},body:JSON.stringify(body)});if(!r.ok)throw new Error('fixture HTTP '+r.status);return r.json();}
  const tenant='10000000-0000-4000-8000-000000000001';
  const shop=await post('/api/v1/merchant/tenants/'+tenant+'/shops',{name:'Reliability shop',slug:'reliable-'+crypto.randomUUID()});
  const empty=await post('/api/v1/merchant/tenants/'+tenant+'/shops',{name:'Empty reliability shop',slug:'empty-'+crypto.randomUUID()});
  const base='/api/v1/merchant/shops/'+shop.id+'/products';
  const draft=await post(base,{title:'Unique draft',description:'',price:{amountMinor:0,currency:'EUR'}});
  const published=await post(base,{title:'Unique published',description:'',price:{amountMinor:1200,currency:'EUR'}});
  await post(base+'/'+published.id+'/publish',{});return {shop,empty,draft,published};
 });
 await page.reload();await page.getByLabel('Product shop').selectOption(seeded.shop.id);
 await expect(page.getByRole('list',{name:'Merchant products'})).toContainText('Unique draft');return seeded;
}
test('MC-06/07 self-contained filters, empty shop, create and publish refresh',async({page})=>{
 const f=await fixture(page),list=page.getByRole('list',{name:'Merchant products'});
 await page.getByLabel('Product status').selectOption('draft');await expect(list).toContainText('Unique draft');await expect(list).not.toContainText('Unique published');
 await page.getByLabel('Product title').fill('New visible draft');await page.getByLabel('Description').fill('');await page.getByLabel('Price (cents)').fill('0');
 await page.getByRole('button',{name:'Create draft',exact:true}).click();await expect(list).toContainText('New visible draft');
 await page.getByRole('button',{name:'Publish product',exact:true}).click();await expect(page.getByText('Draft: New visible draft (published)',{exact:true})).toBeVisible();await expect(list).not.toContainText('New visible draft');
 await page.getByLabel('Product status').selectOption('published');await expect(list).toContainText('New visible draft');await expect(list).not.toContainText('Unique draft');
 await page.getByLabel('Product shop').selectOption(f.empty.id);await expect(page.getByText('No products match this filter.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Publish product',exact:true})).toHaveCount(0);
});
test('MC-06 list loading, failure and explicit retry (injected failure)',async({page})=>{
 await fixture(page);let release!:()=>void;const gate=new Promise<void>(r=>release=r);let arrived!:()=>void;const seen=new Promise<void>(r=>arrived=r);
 await page.route(url=>listUrl(url.href),async route=>{arrived();await gate;await route.fulfill({status:503,json:{error:{code:'SERVICE_UNAVAILABLE',message:'Request failed.'}}});},{times:1});
 await page.getByLabel('Product status').selectOption('draft');await seen;await expect(page.getByText('Loading products…',{exact:true})).toBeVisible();release();
 await expect(page.getByRole('alert')).toContainText('SERVICE_UNAVAILABLE');await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('list',{name:'Merchant products'})).toContainText('Unique draft');
});
for(const status of [200,401,503])test(`MC-06 stale ${status} list response cannot affect newer filter (injected timing)`,async({page})=>{
 const f=await fixture(page);let release!:()=>void;const gate=new Promise<void>(r=>release=r);let arrived!:()=>void;const seen=new Promise<void>(r=>arrived=r);let done!:()=>void;const finished=new Promise<void>(r=>done=r);
 await page.route(url=>listUrl(url.href)&&url.searchParams.get('status')==='draft',async route=>{arrived();await gate;await route.fulfill({status,json:status===200?{items:[f.draft],nextCursor:null}:{error:{code:status===401?'AUTHENTICATION_REQUIRED':'SERVICE_UNAVAILABLE',message:'Request failed.'}}});done();},{times:1});
 await page.getByLabel('Product status').selectOption('draft');await seen;
 await page.getByLabel('Product status').selectOption('published');await expect(page.getByRole('list',{name:'Merchant products'})).toContainText('Unique published');
 release();await finished;await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await expect(page.getByRole('button',{name:'Log out',exact:true})).toBeVisible();await expect(page.getByRole('list',{name:'Merchant products'})).not.toContainText('Unique draft');await expect(page.getByRole('alert')).toHaveCount(0);
});
test('MC-06 pending list cannot restore data after logout (injected timing)',async({page})=>{
 const f=await fixture(page);let release!:()=>void;const gate=new Promise<void>(r=>release=r);let arrived!:()=>void;const seen=new Promise<void>(r=>arrived=r);
 await page.route(url=>listUrl(url.href),async route=>{arrived();await gate;await route.fulfill({json:{items:[f.draft],nextCursor:null}});},{times:1});
 await page.getByLabel('Product status').selectOption('draft');await seen;await page.getByRole('button',{name:'Log out',exact:true}).click();await expect(page.getByRole('link',{name:'Sign in'})).toBeVisible();release();await expect(page.getByRole('list',{name:'Merchant products'})).toHaveCount(0);
});
test('MC-06 current 401 clears catalog and session (injected failure)',async({page})=>{
 await fixture(page);await page.route(url=>listUrl(url.href),route=>route.fulfill({status:401,json:{error:{code:'AUTHENTICATION_REQUIRED',message:'Request failed.'}}}),{times:1});
 await page.getByLabel('Product status').selectOption('draft');await expect(page.getByRole('link',{name:'Sign in'})).toBeVisible();await expect(page.getByRole('list',{name:'Merchant products'})).toHaveCount(0);
});
for(const operation of ['create','publish'])test(`MC-07 late ${operation} cannot restore another shop controls (injected timing)`,async({page})=>{
 const f=await fixture(page);let release!:()=>void;const gate=new Promise<void>(r=>release=r);let arrived!:()=>void;const seen=new Promise<void>(r=>arrived=r);let done!:()=>void;const finished=new Promise<void>(r=>done=r);
 if(operation==='publish'){await page.getByLabel('Product title').fill('Late draft');await page.getByRole('button',{name:'Create draft',exact:true}).click();await expect(page.getByText('Draft: Late draft (draft)',{exact:true})).toBeVisible();}
 await page.route(url=>operation==='create'?url.pathname.endsWith('/'+f.shop.id+'/products'):url.pathname.endsWith('/publish'),async route=>{if(route.request().method()!=='POST')return route.continue();const response=await route.fetch();arrived();await gate;await route.fulfill({response});done();});
 if(operation==='create')await page.getByLabel('Product title').fill('Late draft');await page.getByRole('button',{name:operation==='create'?'Create draft':'Publish product',exact:true}).click();await seen;
 await page.getByLabel('Product shop').selectOption(f.empty.id);release();await finished;await expect(page.getByText('No products match this filter.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Publish product',exact:true})).toHaveCount(0);
});
for(const target of ['shop','tenant'])test(`MC-06 switching ${target} invalidates pending list immediately (injected timing)`,async({page})=>{
 const f=await fixture(page);const tenantB='10000000-0000-4000-8000-000000000002';
 if(target==='tenant'){
  await page.route('**/api/v1/merchant/tenants',async route=>{const response=await route.fetch();const data=await response.json();data.items.push({tenantId:tenantB,name:'Synthetic second tenant',role:'owner',canCreateShop:true});await route.fulfill({json:data});});
  await page.route('**/api/v1/merchant/tenants/'+tenantB+'/shops',route=>route.fulfill({json:{items:[]}}));
  await page.reload();await page.getByLabel('Product shop').selectOption(f.shop.id);await expect(page.getByRole('list',{name:'Merchant products'})).toContainText('Unique draft');
 }
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);let arrived!:()=>void;const seen=new Promise<void>(r=>arrived=r);let done!:()=>void;const finished=new Promise<void>(r=>done=r);
 await page.route(url=>listUrl(url.href)&&url.pathname.includes(f.shop.id),async route=>{arrived();await gate;await route.fulfill({status:401,json:{error:{code:'AUTHENTICATION_REQUIRED',message:'Request failed.'}}});done();},{times:1});
 await page.getByLabel('Product status').selectOption('draft');await seen;
 if(target==='shop')await page.getByLabel('Product shop').selectOption(f.empty.id);else await page.getByLabel('Tenant',{exact:true}).selectOption(tenantB);
 release();await finished;await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await expect(page.getByRole('button',{name:'Log out',exact:true})).toBeVisible();await expect(page.getByRole('list',{name:'Merchant products'})).toHaveCount(0);
});
