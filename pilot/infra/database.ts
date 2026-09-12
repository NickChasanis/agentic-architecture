import {readFileSync} from 'node:fs';
import pg from 'pg';
const config=JSON.parse(readFileSync(new URL('../.local/config.json',import.meta.url),'utf8'));
const pool=new pg.Pool({connectionString:config.databaseUrl});
try{
 for(const name of ['identity-tenancy','shops','catalog'])await pool.query(readFileSync(new URL('../modules/'+name+'/schema.sql',import.meta.url),'utf8'));
 await pool.query(readFileSync(new URL('./integrity.sql',import.meta.url),'utf8'));
 // Fixture seed is idempotent and does not restore deliberately revoked grants on every application start.
 for(const u of config.users)await pool.query('INSERT INTO identity.principals VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[u.id,config.issuer,u.id,u.username!=='disabled']);
 const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
 await pool.query('INSERT INTO identity.tenants VALUES($1,\'Tenant A\'),($2,\'Tenant B\') ON CONFLICT DO NOTHING',[a,b]);
 for(const [i,tenant,role] of [[0,a,'owner'],[1,a,'staff'],[2,a,'staff'],[4,a,'owner'],[5,b,'owner']] as const)
  await pool.query('INSERT INTO identity.memberships(principal_id,tenant_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[config.users[i].id,tenant,role]);
 const shops=[['20000000-0000-4000-8000-000000000001',a,'Shop A1','shop-a1'],
  ['20000000-0000-4000-8000-000000000002',a,'Shop A2','shop-a2'],
  ['20000000-0000-4000-8000-000000000003',b,'Shop B1','shop-b1']];
 for(const s of shops)await pool.query('INSERT INTO shops.shops VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',s);
 await pool.query('INSERT INTO identity.grants(principal_id,tenant_id,shop_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[config.users[1].id,a,shops[0][0]]);
 console.log('Module migrations and synthetic fixture foundation-1 verified; secrets not printed.');
}finally{await pool.end();}
