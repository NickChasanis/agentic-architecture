import * as oidc from 'openid-client';
import {DomainError} from '../../modules/identity-tenancy/service.js';
export type AppConfig={origin:string;issuer:string;clientId:string;clientSecret:string;databaseUrl:string};
export async function connectOidc(config:AppConfig){
 const client=await oidc.discovery(new URL(config.issuer),config.clientId,config.clientSecret,undefined,
  {timeout:5,execute:[oidc.enableNonRepudiationChecks]});
 return {
  async authorize(t:{state:string;nonce:string;verifier:string}){
   return oidc.buildAuthorizationUrl(client,{redirect_uri:config.origin+'/api/v1/auth/callback',
    scope:'openid',state:t.state,nonce:t.nonce,code_challenge:await oidc.calculatePKCECodeChallenge(t.verifier),
    code_challenge_method:'S256'}).href;
  },
  async exchange(url:URL,t:{state:string;nonce:string;verifier:string}){
   try {
    const tokens=await oidc.authorizationCodeGrant(client,url,
     {pkceCodeVerifier:t.verifier,expectedState:t.state,expectedNonce:t.nonce,idTokenExpected:true});
    const claims=tokens.claims();
    if(!claims||claims.iss!==config.issuer||typeof claims.sub!=='string'||!claims.sub.length)
     throw new DomainError('LOGIN_FAILED');
    return {issuer:claims.iss,subject:claims.sub};
   }catch(e){
    if(e instanceof DomainError)throw e;
    const error=e as {code?:string;name?:string;cause?:{code?:string}};
    const network=error.name==='TimeoutError'||error.name==='AbortError'||error.code==='OAUTH_TIMEOUT'||
     ['ECONNREFUSED','ECONNRESET','ENOTFOUND','UND_ERR_CONNECT_TIMEOUT'].includes(error.cause?.code??'');
    throw new DomainError(network?'IDENTITY_SERVICE_UNAVAILABLE':'LOGIN_FAILED');
   }
  }
 };
}
