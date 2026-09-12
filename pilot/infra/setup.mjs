import { mkdirSync,existsSync,writeFileSync,readFileSync,chmodSync } from 'node:fs';
import { randomBytes,createHash,X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {realmFixture} from './realm.mjs';
const dir=new URL('../.local/',import.meta.url);
mkdirSync(dir,{recursive:true,mode:0o700});
const file=n=>new URL(n,dir);
if(existsSync(file('config.json'))) {
  if(process.argv.includes('--refresh-fixture')){
    const c=JSON.parse(readFileSync(file('config.json'),'utf8'));
    const users=c.users.map(u=>({id:u.id,username:u.username,enabled:true,credentials:[{type:'password',value:u.password,temporary:false}]}));
    writeFileSync(file('realm.json'),JSON.stringify(realmFixture(users,c.clientSecret,c.origin),null,2),{mode:0o600});
    chmodSync(file('realm.json'),0o600);chmodSync(file('tls.key'),0o600);
    console.log('Local import fixture refreshed; running provider is unchanged until explicit disposable reset.');
  }
  console.log('Existing local configuration preserved; use verified fixture revision, not startup as reset.');
  process.exit(0);
}
const secret=()=>randomBytes(32).toString('hex');
const db=secret(), kcdb=secret(), clientSecret=secret();
const users=['owner','staff','ungranted','empty','disabled','outsider'].map((username,i)=>({
  id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,
  username,enabled:true,emailVerified:true,
  credentials:[{type:'password',value:secret(),temporary:false}],
}));
const config={fixtureRevision:'foundation-1',origin:'https://localhost:3443',
  issuer:'https://localhost:8443/realms/agentic-pilot',clientId:'merchant',clientSecret,
  databaseUrl:`postgres://postgres:${db}@127.0.0.1:55432/pilot`,
  users:users.map(u=>({id:u.id,username:u.username,password:u.credentials[0].value}))};
const write=(n,s)=>writeFileSync(file(n),s,{mode:0o600,flag:'wx'});
write('compose.env',`DB_PASSWORD=${db}\nKC_DB_PASSWORD=${kcdb}\n`);
write('init.sql',`CREATE USER keycloak WITH PASSWORD '${kcdb}';\nCREATE DATABASE keycloak OWNER keycloak;\n`);
write('realm.json',JSON.stringify(realmFixture(users,clientSecret,config.origin),null,2));
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',file('tls.key').pathname,
  '-out',file('tls.crt').pathname,'-days','30','-subj','/CN=localhost',
  '-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{stdio:'ignore'});
// Keycloak and this host use UID 1000; keep key/realm private. PostgreSQL init
// runs as UID 70, so only its init file is readable inside the 0700 parent.
chmodSync(file('tls.key'),0o600); chmodSync(file('realm.json'),0o600); chmodSync(file('init.sql'),0o644);
const cert=new X509Certificate(readFileSync(file('tls.crt')));
config.browserSpki=createHash('sha256').update(cert.publicKey.export({type:'spki',format:'der'})).digest('base64');
write('config.json',JSON.stringify(config,null,2));
console.log('Generated isolated secrets, fixture revision and localhost-only certificate; no values printed.');
