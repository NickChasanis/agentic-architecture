import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allowedImport} from '../../infra/boundaries.mjs';
test('negative domain dependency exercise',()=>{
 assert.equal(allowedImport('modules/identity-tenancy/service.ts','../shops/service.js'),false);
 assert.equal(allowedImport('modules/shops/service.ts','fastify'),false);
 assert.equal(allowedImport('apps/merchant-admin/src/main.ts','../../../modules/shops/service.js'),false);
 assert.equal(allowedImport('modules/shops/service.ts','pg'),true);
 assert.equal(allowedImport('apps/merchant-admin/src/main.ts','../../../contracts/schemas/wire.schema.json'),true);
});
