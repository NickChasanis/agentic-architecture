import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderPublicCatalogCard} from '../../modules/storefront/public-catalog.js';

test('storefront consumer renders the public catalog contract only',()=>{
 const card=renderPublicCatalogCard({id:'p1',title:'Notebook',description:'Plain',price:{amountMinor:1250,currency:'EUR'}});
 assert.deepEqual(card,{id:'p1',title:'Notebook',price:'€12.50',description:'Plain'});
});

test('storefront consumer rejects merchant fields instead of coupling to them',()=>{
 assert.throws(()=>renderPublicCatalogCard({id:'p1',title:'Notebook',description:'Plain',price:{amountMinor:1250,currency:'EUR'},tenantId:'private'} as any),/public catalog contract/);
});
