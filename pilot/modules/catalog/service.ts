import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
export class CatalogError extends Error {constructor(public code:string){super(code);}}
export type Draft={title:string;description:string;price:{amountMinor:number;currency:'EUR'}};
export type Permission={role:'owner'|'staff';shopIds:string[]};
const merchant=(r:any)=>({id:r.id,tenantId:r.tenant_id,shopId:r.shop_id,status:r.status,title:r.title,description:r.description,price:{amountMinor:r.amount_minor,currency:r.currency}});
const pub=(r:any)=>({id:r.id,title:r.title,description:r.description,price:{amountMinor:r.amount_minor,currency:r.currency}});
export class Catalog {
 constructor(private pool:Pool){}
 async merchantList(shopId:string,permission:Permission,status?:'draft'|'published'){
  await this.authorized(shopId,permission);
  const rows=await this.pool.query('SELECT * FROM catalog.products WHERE shop_id=$1 AND ($2::text IS NULL OR status=$2) ORDER BY id',[shopId,status??null]);
  return {items:rows.rows.map(merchant)};
 }
 private async authorized(shopId:string,permission:Permission){
  if(permission.role==='owner')return;
  if(!permission.shopIds.includes(shopId))throw new CatalogError('RESOURCE_NOT_FOUND');
 }
 async create(tenantId:string,shopId:string,input:Draft,permission:Permission){
  await this.authorized(shopId,permission);
  const r=await this.pool.query('INSERT INTO catalog.products(id,tenant_id,shop_id,status,title,description,amount_minor,currency) VALUES($1,$2,$3,\'draft\',$4,$5,$6,$7) RETURNING *',[randomUUID(),tenantId,shopId,input.title,input.description,input.price.amountMinor,input.price.currency]);
  return merchant(r.rows[0]);
 }
 async get(shopId:string,id:string,permission:Permission){
  await this.authorized(shopId,permission);
  const r=await this.pool.query('SELECT * FROM catalog.products WHERE id=$1 AND shop_id=$2',[id,shopId]);
  if(!r.rowCount)throw new CatalogError('RESOURCE_NOT_FOUND');return merchant(r.rows[0]);
 }
 async update(shopId:string,id:string,input:Draft,permission:Permission){
  await this.authorized(shopId,permission);const c=await this.pool.connect();
  try{await c.query('BEGIN');const r=await c.query('SELECT * FROM catalog.products WHERE id=$1 AND shop_id=$2 FOR UPDATE',[id,shopId]);
   if(!r.rowCount)throw new CatalogError('RESOURCE_NOT_FOUND');if(r.rows[0].status==='published')throw new CatalogError('PRODUCT_IMMUTABLE');
   const u=await c.query('UPDATE catalog.products SET title=$3,description=$4,amount_minor=$5,currency=$6,updated_at=now() WHERE id=$1 AND shop_id=$2 RETURNING *',[id,shopId,input.title,input.description,input.price.amountMinor,input.price.currency]);
   await c.query('COMMIT');return merchant(u.rows[0]);
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 async publish(shopId:string,id:string,permission:Permission){
  await this.authorized(shopId,permission);const c=await this.pool.connect();
  try{await c.query('BEGIN');const r=await c.query('SELECT * FROM catalog.products WHERE id=$1 AND shop_id=$2 FOR UPDATE',[id,shopId]);
   if(!r.rowCount)throw new CatalogError('RESOURCE_NOT_FOUND');if(r.rows[0].status==='published'){await c.query('COMMIT');return merchant(r.rows[0]);}
   const u=await c.query('UPDATE catalog.products SET status=\'published\',published_at=now(),updated_at=now() WHERE id=$1 RETURNING *',[id]);
   await c.query('COMMIT');return merchant(u.rows[0]);
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 async publicList(slug:string){
  const r=await this.pool.query('SELECT p.* FROM catalog.products p JOIN shops.shops s ON s.id=p.shop_id WHERE s.slug=$1 AND p.status=\'published\' ORDER BY p.id',[slug]);
  if(!r.rowCount){const shop=await this.pool.query('SELECT 1 FROM shops.shops WHERE slug=$1',[slug]);if(!shop.rowCount)throw new CatalogError('RESOURCE_NOT_FOUND');}
  return {items:r.rows.map(pub)};
 }
 async publicGet(slug:string,id:string){
  const r=await this.pool.query('SELECT p.* FROM catalog.products p JOIN shops.shops s ON s.id=p.shop_id WHERE s.slug=$1 AND p.id=$2 AND p.status=\'published\'',[slug,id]);
  if(!r.rowCount)throw new CatalogError('RESOURCE_NOT_FOUND');return pub(r.rows[0]);
 }
}
