import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import pg from 'pg';
const c=JSON.parse(readFileSync('.local/config.json','utf8'));
const discovery=await fetch(c.issuer+'/.well-known/openid-configuration');
assert.equal(discovery.status,200);
const metadata=await discovery.json();assert.equal(metadata.issuer,c.issuer);
assert.ok(metadata.authorization_endpoint.startsWith(c.issuer+'/'));
const url=new URL(c.databaseUrl);url.pathname='/keycloak';
const pool=new pg.Pool({connectionString:url.href});
try{
 const r=await pool.query("SELECT u.id,u.username FROM user_entity u JOIN realm r ON u.realm_id=r.id WHERE r.name='agentic-pilot' ORDER BY username");
 assert.deepEqual(r.rows,c.users.map(u=>({id:u.id,username:u.username})).sort((a,b)=>a.username.localeCompare(b.username)));
 const attributes=await pool.query("SELECT a.value FROM realm_attribute a JOIN realm r ON a.realm_id=r.id WHERE r.name='agentic-pilot' AND a.name='fixtureRevision'");
 assert.equal(attributes.rows[0].value,c.fixtureRevision);
 console.log('PASS: trusted HTTPS issuer, exact imported fixture revision and actual issuer/subject mapping.');
}finally{await pool.end();}
