import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { createApp } from '../../apps/api/app.js';
const config=JSON.parse(readFileSync(new URL('../../.local/config.json',import.meta.url),'utf8'));
const tenant='10000000-0000-4000-8000-000000000001';
test('anonymous cannot introspect or forge principal headers',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const app=await createApp({config,pool});t.after(async()=>{await app.close();await pool.end();});
 for(const headers of [{},{'x-principal-id':config.users[0].id,'x-tenant-id':tenant}]){
 const r=await app.inject({url:'/api/v1/auth/session',headers});
 assert.equal(r.statusCode,401);assert.equal(r.json().error.code,'AUTHENTICATION_REQUIRED');
 }
});
test('invalid callback creates no session and clears transaction cookie',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const app=await createApp({config,pool});t.after(async()=>{await app.close();await pool.end();});
 const r=await app.inject({url:'/api/v1/auth/callback?code=x&state=x&code=y',headers:{origin:config.origin}});
 assert.equal(r.statusCode,400);assert.equal(r.json().error.code,'LOGIN_RESPONSE_INVALID');
 assert.ok(String(r.headers['set-cookie']).includes('__Host-pilot-login=;'));
 assert.ok(!String(r.headers['set-cookie']).includes('__Host-pilot-session='));
});
test('login creates bounded secure transaction and fixed provider redirect',async t=>{
 const pool=new pg.Pool({connectionString:config.databaseUrl});
 const app=await createApp({config,pool});t.after(async()=>{await app.close();await pool.end();});
 const r=await app.inject('/api/v1/auth/login');
 assert.equal(r.statusCode,302);
 assert.ok(r.headers.location?.startsWith(config.issuer+'/'));
 const cookie=String(r.headers['set-cookie']);
 for(const attribute of ['__Host-pilot-login=','HttpOnly','Secure','SameSite=Lax','Max-Age=300','Path=/'])assert.ok(cookie.includes(attribute));
 assert.equal(r.headers['cache-control'],'no-store');
});
