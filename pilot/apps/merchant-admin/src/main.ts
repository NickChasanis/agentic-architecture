import {Component,signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {validate,type Session,type Tenant,type Shop} from './contracts';
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
  }
 }</main>`})
class App {
 session=signal<Session|null>(null);tenants=signal<Tenant[]>([]);shops=signal<Shop[]>([]);
 tenantId=signal('');message=signal('');loading=signal(true);busy=signal(false);
 name='';slug='';private selection=0;
 constructor(){void this.load();}
 canCreate(){return this.tenants().find(t=>t.tenantId===this.tenantId())?.canCreateShop??false;}
 async request(path:string,schema:string,method='GET',body?:unknown){
  const r=await fetch(path,{method,credentials:'same-origin',headers:body===undefined?{}:
   {'Content-Type':'application/json','X-CSRF-Token':this.session()?.csrfToken??''},body:body===undefined?undefined:JSON.stringify(body)});
  if(!r.ok){
   if(r.status===401)this.session.set(null);
   const e=validate<{error:{code:string}}> ('ErrorEnvelope',await r.json());
   throw new Error(e.error.code);
  }
  return r.status===204?undefined:validate(schema,await r.json());
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
  this.tenantId.set(id);this.shops.set([]);const version=++this.selection;
  try{
   const data=await this.request('/api/v1/merchant/tenants/'+encodeURIComponent(id)+'/shops','AuthorizedShopList') as {items:Shop[]};
   if(version===this.selection)this.shops.set(data.items);
  }catch(e){if(version===this.selection)this.message.set((e as Error).message);}
 }
 async create(){
  if(this.busy())return;this.busy.set(true);this.message.set('');
  const tenant=this.tenantId();
  try{
   await this.request('/api/v1/merchant/tenants/'+encodeURIComponent(tenant)+'/shops','Shop','POST',{name:this.name,slug:this.slug});
   this.name='';this.slug='';this.message.set('Shop created.');
   if(this.tenantId()===tenant)await this.selectTenant(tenant);
  }catch(e){this.message.set((e as Error).message);}
  finally{this.busy.set(false);}
 }
 async logout(){
  try{await this.request('/api/v1/auth/logout','','POST',{});this.session.set(null);this.shops.set([]);this.tenants.set([]);}
  catch(e){this.message.set((e as Error).message);}
 }
}
bootstrapApplication(App).catch(()=>{document.body.textContent='Application failed to start.';});
