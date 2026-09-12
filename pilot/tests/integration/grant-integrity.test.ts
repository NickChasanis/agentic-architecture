import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import pg from 'pg';
const config=JSON.parse(readFileSync('.local/config.json','utf8'));
test('grant cannot reference a shop in another tenant',async()=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const staff=config.users.find((u:any)=>u.username==='staff').id;
 const shop='20000000-0000-4000-8000-000000000003';
 try{await assert.rejects(pool.query('INSERT INTO identity.grants(principal_id,tenant_id,shop_id) VALUES($1,$2,$3)',
  [staff,'10000000-0000-4000-8000-000000000001',shop]),{code:'23503'});}
 finally{await pool.query('DELETE FROM identity.grants WHERE principal_id=$1 AND shop_id=$2',[staff,shop]);await pool.end();}
});
