import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
export class Shops {
 constructor(private pool:Pool){}
 async list(tenantId:string,permission:{role:'owner'|'staff';shopIds:string[]}){
  const r=await this.pool.query('SELECT id,tenant_id AS "tenantId",name,slug FROM shops.shops WHERE tenant_id=$1 AND ($2 OR id=ANY($3::uuid[])) ORDER BY id',
   [tenantId,permission.role==='owner',permission.shopIds]);
  return r.rows;
 }
 async create(tenantId:string,input:{name:string;slug:string}){
  const r=await this.pool.query('INSERT INTO shops.shops VALUES($1,$2,$3,$4) RETURNING id,tenant_id AS "tenantId",name,slug',[randomUUID(),tenantId,input.name,input.slug]);
  return r.rows[0];
 }
}
