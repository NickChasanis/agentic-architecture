import {Component,signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {validate,type Session,type Tenant,type Shop,type Product} from './contracts';
@Component({selector:'merchant-app',imports:[FormsModule],template:`
 <main><h1>Merchant foundation</h1><p>Local commerce pilot · contract-checked access</p>
 <p class="status" role="status">{{message()}}</p>
 @if(loading()){<p>Loading session…</p>}
 @else if(!session()){<a href="/api/v1/auth/login">Sign in</a>}
 @else{
  <button (click)="logout()">Log out</button>
  @if(tenants().length===0){<p>No tenant memberships.</p>}
  @else{
   <label>Tenant <select aria-label="Tenant" [ngModel]="tenantId()" (ngModelChange)="selectTenant($event)">
    @for(tenant of tenants();track tenant.tenantId){<option [value]="tenant.tenantId">{{tenant.name}}</option>}
   </select></label>
   <section><h2>Your shops</h2><ul aria-label="Authorized shops">
    @for(shop of shops();track shop.id){<li>{{shop.name}} — {{shop.slug}}</li>}
   </ul>@if(shops().length===0){<p>No authorized shops.</p>}</section>
   @if(canCreate()){
    <section><h2>Create a shop</h2><form (ngSubmit)="create()">
     <label>Shop name <input name="name" [(ngModel)]="name" required maxlength="80"></label>
     <label>Shop slug <input name="slug" [(ngModel)]="slug" required minlength="3" maxlength="48" pattern="[a-z0-9]+(-[a-z0-9]+)*"></label>
     <button type="submit" [disabled]="busy()">Create shop</button>
   </form></section>
   }
   @if(shops().length){<section><h2>Catalog</h2>
    <label>Shop <select aria-label="Product shop" [ngModel]="productShopId()" (ngModelChange)="selectProductShop($event)">
     @for(shop of shops();track shop.id){<option [value]="shop.id">{{shop.name}}</option>}
    </select></label>
    <label>Status <select aria-label="Product status" [ngModel]="productStatus()" (ngModelChange)="selectProductStatus($event)">
     <option value="all">All</option><option value="draft">Draft</option><option value="published">Published</option>
    </select></label>
    @if(productsLoading()){<p>Loading products…</p>}
    @else if(productsError()){<p role="alert">{{productsError()}}</p><button type="button" (click)="retryPage()">Retry</button>}
    @else if(products().length===0){<p>No products match this filter.</p>}
    @else {<ul aria-label="Merchant products">
     @for(item of products();track item.id){<li>{{item.title}} — {{item.status}} — {{formatPrice(item)}}</li>}
    </ul>}
    <button type="button" (click)="nextPage()" [disabled]="productsLoading()||!nextCursor()">Next page</button>
    <button type="button" (click)="loadProducts()" [disabled]="productsLoading()">Restart list</button>
    <form (ngSubmit)="createProduct()"><label>Product title <input name="productTitle" [(ngModel)]="productTitle" required maxlength="120"></label>
     <label>Description <textarea name="description" [(ngModel)]="description" maxlength="2000"></textarea></label>
     <label>Price (cents) <input name="price" type="number" [(ngModel)]="price" min="0" max="100000000" required></label>
     <button type="submit" [disabled]="busy()">Create draft</button></form>
    @if(product()){<p>Draft: {{product()?.title}} ({{product()?.status}})</p><button (click)="publishProduct()" [disabled]="product()?.status==='published'">Publish product</button>
     @if(product()?.status==='published'){<a [href]="'/api/v1/public/shops/'+selectedShopSlug()+'/products/'+product()?.id">View public product</a>}}</section>}
   }
  }
 </main>`})
class App {
 session=signal<Session|null>(null);tenants=signal<Tenant[]>([]);shops=signal<Shop[]>([]);products=signal<Product[]>([]);
 tenantId=signal('');message=signal('');loading=signal(true);busy=signal(false);
 name='';slug='';productTitle='';description='';price=0;productShopId=signal('');productStatus=signal<'all'|'draft'|'published'>('all');product=signal<Product|null>(null);productsLoading=signal(false);productsError=signal('');private selection=0;private productSelection=0;
 constructor(){void this.load();}
 nextCursor=signal<string|null>(null);private pageCursor:string|null=null;
 async nextPage(){const cursor=this.nextCursor();if(cursor&&!this.productsLoading())await this.loadProducts(this.productShopId(),cursor);}
 async retryPage(){await this.loadProducts(this.productShopId(),this.pageCursor);}
 private invalidateContext(){
  this.selection++;this.productSelection++;this.products.set([]);this.product.set(null);
  this.nextCursor.set(null);this.pageCursor=null;
  this.productsError.set('');this.productsLoading.set(false);this.message.set('');this.busy.set(false);
 }
 private expireSession(){this.invalidateContext();this.session.set(null);this.shops.set([]);this.tenants.set([]);this.tenantId.set('');this.productShopId.set('');}
 canCreate(){return this.tenants().find(t=>t.tenantId===this.tenantId())?.canCreateShop??false;}
 async request(path:string,schema:string,method='GET',body?:unknown,current=()=>true){
  const r=await fetch(path,{method,credentials:'same-origin',headers:body===undefined?{}:
   {'Content-Type':'application/json','X-CSRF-Token':this.session()?.csrfToken??''},body:body===undefined?undefined:JSON.stringify(body)});
  const data=r.status===204?undefined:await r.json();
  if(!current())throw new Error('Stale response.');
  if(!r.ok){
   if(r.status===401)this.expireSession();
   const e=validate<{error:{code:string}}> ('ErrorEnvelope',data);
   throw new Error(e.error.code);
  }
  return r.status===204?undefined:validate(schema,data);
 }
 async load(){
  try{
   this.session.set(await this.request('/api/v1/auth/session','SessionView') as Session);
   const data=await this.request('/api/v1/merchant/tenants','TenantMembershipList') as {items:Tenant[]};
   this.tenants.set(data.items);if(data.items.length)await this.selectTenant(data.items[0].tenantId);
  }catch(e){if(this.session())this.message.set((e as Error).message);}
  finally{this.loading.set(false);}
 }
 async selectTenant(id:string){
  this.invalidateContext();this.tenantId.set(id);this.shops.set([]);this.productShopId.set('');const version=this.selection;
  const current=()=>version===this.selection&&this.session()!==null;
  try{
   const data=await this.request('/api/v1/merchant/tenants/'+encodeURIComponent(id)+'/shops','AuthorizedShopList','GET',undefined,current) as {items:Shop[]};
   if(current()){this.shops.set(data.items);this.productShopId.set(data.items[0]?.id??'');if(data.items[0])void this.loadProducts(data.items[0].id);}
  }catch(e){if(current())this.message.set((e as Error).message);}
 }
 async selectProductShop(id:string){this.invalidateContext();this.productShopId.set(id);await this.loadProducts(id);}
 async selectProductStatus(status:'all'|'draft'|'published'){this.productStatus.set(status);await this.loadProducts();}
 async loadProducts(shopId=this.productShopId(),cursor:string|null=null){
  if(!shopId||!this.session())return;const version=++this.productSelection,context=this.selection;this.products.set([]);this.productsLoading.set(true);this.productsError.set('');
  this.pageCursor=cursor;this.nextCursor.set(null);
  const current=()=>version===this.productSelection&&context===this.selection&&shopId===this.productShopId()&&this.session()!==null;
  try{const query=new URLSearchParams();if(this.productStatus()!=='all')query.set('status',this.productStatus());if(cursor)query.set('cursor',cursor);
   const data=await this.request('/api/v1/merchant/shops/'+encodeURIComponent(shopId)+'/products/page'+(query.size?'?'+query:''),'MerchantProductPage','GET',undefined,current) as {items:Product[];nextCursor:string|null};
   if(current()){this.products.set(data.items);this.nextCursor.set(data.nextCursor);}
  }catch(e){if(current())this.productsError.set((e as Error).message);}
  finally{if(current())this.productsLoading.set(false);}
 }
 formatPrice(p:Product){return new Intl.NumberFormat('en-IE',{style:'currency',currency:p.price.currency}).format(p.price.amountMinor/100);}
 selectedShopSlug(){return this.shops().find(s=>s.id===this.productShopId())?.slug??'';}
 async createProduct(){
  if(this.busy()||!this.productShopId())return;this.busy.set(true);
  const context=this.selection,shop=this.productShopId(),current=()=>context===this.selection&&shop===this.productShopId()&&this.session()!==null;
  try{const p=await this.request('/api/v1/merchant/shops/'+shop+'/products','DraftProduct','POST',{title:this.productTitle,description:this.description,price:{amountMinor:Number(this.price),currency:'EUR'}},current) as Product;
   if(current()){this.product.set(p);await this.loadProducts();if(current())this.message.set('Draft created.');}}
  catch(e){if(current())this.message.set((e as Error).message);}finally{if(current())this.busy.set(false);}
 }
 async publishProduct(){
  const p=this.product();if(!p||this.busy()||p.shopId!==this.productShopId())return;this.busy.set(true);
  const context=this.selection,current=()=>context===this.selection&&p.shopId===this.productShopId()&&this.session()!==null;
  try{const published=await this.request('/api/v1/merchant/shops/'+p.shopId+'/products/'+p.id+'/publish','PublishedProduct','POST',{},current) as Product;
   if(current()){this.product.set(published);await this.loadProducts();if(current())this.message.set('Product published.');}}
  catch(e){if(current())this.message.set((e as Error).message);}finally{if(current())this.busy.set(false);}
 }
 async create(){
  if(this.busy())return;this.busy.set(true);this.message.set('');
  const tenant=this.tenantId(),context=this.selection,current=()=>context===this.selection&&this.session()!==null;
  try{
   await this.request('/api/v1/merchant/tenants/'+encodeURIComponent(tenant)+'/shops','Shop','POST',{name:this.name,slug:this.slug},current);
   if(!current())return;
   this.name='';this.slug='';this.message.set('Shop created.');
   if(this.tenantId()===tenant)await this.selectTenant(tenant);
  }catch(e){if(current())this.message.set((e as Error).message);}
  finally{if(current())this.busy.set(false);}
 }
 async logout(){
  this.invalidateContext();const context=this.selection,current=()=>context===this.selection;
  try{await this.request('/api/v1/auth/logout','','POST',{},current);if(current())this.expireSession();}
  catch(e){if(current())this.message.set((e as Error).message);}
 }
}
bootstrapApplication(App).catch(()=>{document.body.textContent='Application failed to start.';});
