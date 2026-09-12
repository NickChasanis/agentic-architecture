export function realmFixture(users,clientSecret,origin){
 return {realm:'agentic-pilot',enabled:true,registrationAllowed:false,sslRequired:'all',
  attributes:{fixtureRevision:'foundation-1'},
  users:users.map(u=>({...u,email:u.username+'@example.invalid',emailVerified:true,
   firstName:u.username,lastName:'Pilot',requiredActions:[]})),
  clients:[{clientId:'merchant',secret:clientSecret,enabled:true,publicClient:false,
   standardFlowEnabled:true,directAccessGrantsEnabled:false,implicitFlowEnabled:false,
   redirectUris:[origin+'/api/v1/auth/callback'],webOrigins:[],
   attributes:{'pkce.code.challenge.method':'S256'}}]};
}
