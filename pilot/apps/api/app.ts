import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import {Ajv} from 'ajv';
import addFormats from 'ajv-formats';
import {readFileSync} from 'node:fs';
import type {Pool} from 'pg';
import {Identity,DomainError,type Session} from '../../modules/identity-tenancy/service.js';
import {Shops} from '../../modules/shops/service.js';
import {connectOidc,type AppConfig} from './oidc.js';
declare module 'fastify' {interface FastifyRequest {session:Session|null}}
const manifest=JSON.parse(readFileSync('contracts/operations/http.json','utf8'));
const bundle=JSON.parse(readFileSync('contracts/schemas/wire.schema.json','utf8'));
const ref=(name:string)=>({$ref:bundle.$id+'#/definitions/'+name});
const sessionCookie='__Host-pilot-session',loginCookie='__Host-pilot-login';
const cookieOptions={secure:true,httpOnly:true,sameSite:'lax' as const,path:'/'};
export async function createApp({config,pool,now=()=>new Date(),https,oidcAdapter}:{
 config:AppConfig;pool:Pool;now?:()=>Date;https?:{key:Buffer;cert:Buffer};
 oidcAdapter?:Awaited<ReturnType<typeof connectOidc>>;
}){
 const app=Fastify({logger:false,...(https?{https}:{}),bodyLimit:manifest.bodyLimitBytes,trustProxy:false,
  ajv:{customOptions:{coerceTypes:false,removeAdditional:false,useDefaults:false,strict:false}},
  serializerOpts:{ajv:{strictTypes:false}}});
 await app.register(cookie);
 app.decorateRequest('session',null);
 const identity=new Identity(pool,now),shops=new Shops(pool);
 let oidcPromise:Promise<Awaited<ReturnType<typeof connectOidc>>>|undefined;
 const getOidc=async()=>{
  if(oidcAdapter)return oidcAdapter;
  try{return await (oidcPromise??=connectOidc(config));}
  catch{oidcPromise=undefined;throw new DomainError('IDENTITY_SERVICE_UNAVAILABLE');}
 };
 app.addSchema(bundle);
 const ajv=addFormats.default(new Ajv({strict:false,coerceTypes:false,removeAdditional:false}));
 ajv.addSchema(bundle);
 const validators=new Map<string,ReturnType<typeof ajv.compile>>();
 for(const name of Object.keys(bundle.definitions))validators.set(name,ajv.compile(ref(name)));
 app.addHook('onSend',async(_req,reply,payload)=>{
  reply.header('cache-control','no-store').header('x-content-type-options','nosniff')
   .header('referrer-policy','no-referrer');
  return payload;
 });
 app.setErrorHandler(async(error,req,reply)=>{
  const op=(req.routeOptions.config as {operation?:any}).operation;
  let code=error instanceof DomainError?error.code:'INTERNAL_ERROR';
  const framework:Record<string,string>={FST_ERR_CTP_INVALID_JSON_BODY:'MALFORMED_JSON',
   FST_ERR_CTP_EMPTY_JSON_BODY:'MALFORMED_JSON',FST_ERR_CTP_BODY_TOO_LARGE:'BODY_TOO_LARGE',
   FST_ERR_CTP_INVALID_MEDIA_TYPE:'UNSUPPORTED_MEDIA_TYPE'};
  const e=error as {code?:string;validation?:unknown};
  if(e.code&&framework[e.code])code=framework[e.code];
  if(e.validation)code=op?.queryValidationError??'VALIDATION_FAILED';
  if(e.code==='23505')code='SLUG_UNAVAILABLE';
  if(e.code&&(/^(08|53|57)/.test(e.code)||['ECONNREFUSED','ECONNRESET'].includes(e.code)))
   code=op?.id==='ID-01'||op?.id==='ID-02'?'IDENTITY_SERVICE_UNAVAILABLE':'SERVICE_UNAVAILABLE';
  if(op?.id==='ID-02'){
   reply.clearCookie(loginCookie,cookieOptions);
   try{await identity.discardTransaction(req.cookies[loginCookie]);}catch{code='IDENTITY_SERVICE_UNAVAILABLE';}
  }
  if(!op?.errorCodes.includes(code))code='INTERNAL_ERROR';
  return reply.code(manifest.errorStatusByCode[code]).send({error:{code,message:'Request failed.'}});
 });
 const limiter=new Map<string,{start:number;count:number}>();
 for(const op of manifest.operations.filter((x:any)=>x.id.startsWith('ID-')||x.id==='HTTP-01')){
  const response:Record<number,any>={};
  if(op.success.bodySchema)response[op.success.status]=ref(op.success.bodySchema);
  for(const code of op.errorCodes)response[manifest.errorStatusByCode[code]]=ref('ErrorEnvelope');
  app.route({method:op.method,url:op.path.replace(/\{(\w+)\}/g,':$1'),config:{operation:op},
   schema:{params:ref(op.paramsSchema),querystring:ref(op.querySchema),response,
    ...(op.bodySchema?{body:ref(op.bodySchema)}:{})},
   preValidation:async req=>{
    if(op.bodySchema&&req.headers['content-type']?.split(';')[0].trim().toLowerCase()!=='application/json')
     throw new DomainError('UNSUPPORTED_MEDIA_TYPE');
    if(op.authentication==='session'){
     req.session=await identity.authenticate(req.cookies[sessionCookie]);
     if(!req.session)throw new DomainError('AUTHENTICATION_REQUIRED');
     if(op.csrfRequired&&(req.headers.origin!==config.origin||!identity.validCsrf(req.session,req.headers['x-csrf-token'])))
      throw new DomainError('CSRF_REJECTED');
    }
    if(req.body&&typeof req.body==='object'&&!Array.isArray(req.body)){
     const body=req.body as Record<string,unknown>;
     if(typeof body.name==='string')body.name=body.name.trim();
    }
   },
   handler:async(req,reply)=>{
    let body:unknown;
    const principalId=req.session?.principalId;
    const params=req.params as {tenantId:string};
    switch(op.id){
     case 'ID-01':{
      const ms=now().getTime();
      for(const [key,bucket] of limiter)if(ms-bucket.start>=60000)limiter.delete(key);
      const bucket=limiter.get(req.ip)??{start:ms,count:0};
      if(bucket.count>=20||(!limiter.has(req.ip)&&limiter.size>=1000))throw new DomainError('IDENTITY_SERVICE_UNAVAILABLE');
      bucket.count++;limiter.set(req.ip,bucket);
      const client=await getOidc(),t=await identity.startTransaction(req.cookies[loginCookie]);
      reply.setCookie(loginCookie,t.binding,{...cookieOptions,maxAge:300});
      return reply.code(302).header('location',await client.authorize(t)).send();
     }
     case 'ID-02':{
      reply.clearCookie(loginCookie,cookieOptions);
      const query=req.query as {state:string};
      const t=await identity.consumeTransaction(req.cookies[loginCookie],query.state);
      if(!t)throw new DomainError('LOGIN_RESPONSE_INVALID');
      const claims=await (await getOidc()).exchange(new URL(req.url,config.origin),t);
      const s=await identity.establish(claims.issuer,claims.subject,req.cookies[sessionCookie]);
      reply.setCookie(sessionCookie,s.id,{...cookieOptions,maxAge:28800});
      return reply.code(303).header('location',config.origin+'/').send();
     }
     case 'ID-03':body={principal:{id:principalId},csrfToken:req.session!.csrf,absoluteExpiresAt:req.session!.absoluteExpiresAt};break;
     case 'ID-04':
      await identity.revoke(req.cookies[sessionCookie]);reply.clearCookie(sessionCookie,cookieOptions);return reply.code(204).send();
     case 'ID-05':body={items:await identity.memberships(principalId!)};break;
     case 'ID-06':{
      const permission=await identity.access(principalId!,params.tenantId);
      body={items:await shops.list(params.tenantId,permission)};break;
     }
     case 'HTTP-01':{
      const permission=await identity.access(principalId!,params.tenantId);
      if(permission.role!=='owner')throw new DomainError('RESOURCE_NOT_FOUND');
      body=await shops.create(params.tenantId,req.body as {name:string;slug:string});break;
     }
    }
    if(!validators.get(op.success.bodySchema)!(body))throw new DomainError('INTERNAL_ERROR');
    return reply.code(op.success.status).send(body);
   }});
 }
 return app;
}
