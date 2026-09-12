import { randomBytes,createHash,timingSafeEqual } from 'node:crypto';
import type { Pool } from 'pg';
export const token=()=>randomBytes(32).toString('base64url');
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export class DomainError extends Error {
 constructor(public code:string){super('Request failed.');}
}
export type Session={principalId:string;csrf:string;absoluteExpiresAt:string};
export type LoginTransaction={binding:string;state:string;nonce:string;verifier:string};
export class Identity {
 constructor(private pool:Pool,private now:()=>Date=()=>new Date()){}
 async startTransaction(previous?:string):Promise<LoginTransaction>{
  const c=await this.pool.connect();
  try{
   await c.query('BEGIN');
   await c.query('SELECT pg_advisory_xact_lock(17012026)');
   await c.query('DELETE FROM identity.transactions WHERE expires_at <= $1 OR binding_hash=$2',[this.now(),hash(previous??'')]);
   const count=await c.query('SELECT count(*)::int AS count FROM identity.transactions');
   if(count.rows[0].count>=1000)throw new DomainError('IDENTITY_SERVICE_UNAVAILABLE');
   const t={binding:token(),state:token(),nonce:token(),verifier:token()};
   await c.query('INSERT INTO identity.transactions VALUES($1,$2,$3,$4,$5)',
    [hash(t.binding),t.state,t.nonce,t.verifier,new Date(this.now().getTime()+300000)]);
   await c.query('COMMIT');return t;
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 async consumeTransaction(binding?:string,state?:string){
  if(!binding)return null;
  // Consume by browser binding even for wrong/malformed state; never touch another browser.
  const r=await this.pool.query('DELETE FROM identity.transactions WHERE binding_hash=$1 RETURNING *',[hash(binding)]);
  const t=r.rows[0];
  return t&&t.state===state&&t.expires_at>this.now()?t:null;
 }
 async discardTransaction(binding?:string){if(binding)await this.consumeTransaction(binding);}
 async establish(issuer:string,subject:string,previous?:string){
  const c=await this.pool.connect();
  try{
   await c.query('BEGIN');
   const p=await c.query('SELECT id FROM identity.principals WHERE issuer=$1 AND subject=$2 AND active=true',[issuer,subject]);
   if(!p.rowCount)throw new DomainError('ACCOUNT_UNAVAILABLE');
   if(previous)await c.query('DELETE FROM identity.sessions WHERE hash=$1',[hash(previous)]);
   await c.query('DELETE FROM identity.sessions WHERE expires_at <= $1 OR seen_at <= $2',[this.now(),new Date(this.now().getTime()-1800000)]);
   const id=token(),csrf=token(),expires=new Date(this.now().getTime()+28800000);
   await c.query('INSERT INTO identity.sessions VALUES($1,$2,$3,$4,$4,$5)',[hash(id),p.rows[0].id,csrf,this.now(),expires]);
   await c.query('COMMIT');return {id,csrf,principalId:p.rows[0].id,absoluteExpiresAt:expires.toISOString()};
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 async authenticate(id?:string):Promise<Session|null>{
  if(!id)return null;
  const r=await this.pool.query(
   'UPDATE identity.sessions s SET seen_at=$2 FROM identity.principals p WHERE s.hash=$1 AND s.principal_id=p.id AND p.active AND s.expires_at>$2 AND s.seen_at>$3 RETURNING s.principal_id,s.csrf,s.expires_at',
   [hash(id),this.now(),new Date(this.now().getTime()-1800000)]);
  return r.rowCount?{principalId:r.rows[0].principal_id,csrf:r.rows[0].csrf,absoluteExpiresAt:r.rows[0].expires_at.toISOString()}:null;
 }
 validCsrf(session:Session,value:unknown){
  if(typeof value!=='string')return false;
  const a=Buffer.from(session.csrf),b=Buffer.from(value);
  return a.length===b.length&&timingSafeEqual(a,b);
 }
 async revoke(id?:string){if(id)await this.pool.query('DELETE FROM identity.sessions WHERE hash=$1',[hash(id)]);}
 async memberships(principalId:string){
  const r=await this.pool.query('SELECT t.id AS "tenantId",t.name,m.role,(m.role=\'owner\') AS "canCreateShop" FROM identity.memberships m JOIN identity.tenants t ON t.id=m.tenant_id WHERE m.principal_id=$1 AND m.active ORDER BY t.id',[principalId]);
  return r.rows;
 }
 async access(principalId:string,tenantId:string){
  const r=await this.pool.query('SELECT role FROM identity.memberships WHERE principal_id=$1 AND tenant_id=$2 AND active',[principalId,tenantId]);
  if(!r.rowCount)throw new DomainError('RESOURCE_NOT_FOUND');
  const grants=await this.pool.query('SELECT shop_id FROM identity.grants WHERE principal_id=$1 AND tenant_id=$2 AND active',[principalId,tenantId]);
  return {role:r.rows[0].role as 'owner'|'staff',shopIds:grants.rows.map(r=>r.shop_id as string)};
 }
}
