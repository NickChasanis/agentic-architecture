import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import pg from 'pg';
import staticFiles from '@fastify/static';
import {createApp} from './app.js';
const config=JSON.parse(readFileSync('.local/config.json','utf8'));
if(!/^https:\/\/localhost:[0-9]+$/.test(config.origin)||!/^https:\/\/localhost:[0-9]+\/realms\/agentic-pilot$/.test(config.issuer))
 throw new Error('This launcher supports only the isolated local pilot origins.');
const pool=new pg.Pool({connectionString:config.databaseUrl});
const app=await createApp({config,pool,https:{key:readFileSync('.local/tls.key'),cert:readFileSync('.local/tls.crt')}});
await app.register(staticFiles,{root:resolve('dist/merchant/browser'),index:'index.html',wildcard:false});
app.addHook('onClose',async()=>{await pool.end();});
await app.listen({host:'127.0.0.1',port:Number(new URL(config.origin).port)});
console.log('Local merchant foundation listening at '+config.origin+' (no request logging).');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});
