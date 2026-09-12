import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import wire from '../../../contracts/schemas/wire.schema.json';
function consumerView(value:unknown):unknown {
 if(Array.isArray(value))return value.map(consumerView);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='additionalProperties'&&v===false?true:consumerView(v)]));
 return value;
}
const ajv=addFormats(new Ajv({strict:false,coerceTypes:false,removeAdditional:false}));
ajv.addSchema(consumerView(wire) as object);
const checks=new Map<string,ReturnType<typeof ajv.compile>>();
export function validate<T>(name:string,value:unknown):T {
 let check=checks.get(name);
 if(!check){check=ajv.compile({$ref:wire.$id+'#/definitions/'+name});checks.set(name,check);}
 if(!check(value))throw new Error('Response contract mismatch.');
 return value as T;
}
export type Session={principal:{id:string};csrfToken:string;absoluteExpiresAt:string};
export type Tenant={tenantId:string;name:string;role:'owner'|'staff';canCreateShop:boolean};
export type Shop={id:string;tenantId:string;name:string;slug:string};
