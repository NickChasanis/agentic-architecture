import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, ContractError, manifest } from './harness.mjs';

const id = '11111111-1111-4111-8111-111111111111';
const shop = { id, tenantId: id, name: 'Shop', slug: 'shop' };
const url = `/api/v1/merchant/tenants/${id}/shops`;
const input = { name: 'Shop', slug: 'shop' };

async function request(t, options = {}, injection = {}) {
  const app = createHarness({
    authenticate: async () => true,
    verifyCsrf: async () => true,
    handlers: { 'HTTP-01': async () => ({ body: shop }) },
    ...options,
  });
  t.after(() => app.close());
  return app.inject({ method: 'POST', url, payload: input, ...injection });
}

test('valid create serializes the declared response and no-store header', async t => {
  const response = await request(t);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), shop);
  assert.equal(response.headers['cache-control'], 'no-store');
});

for (const payload of [
  { ...input, extra: true }, { ...input, name: 12 },
  { ...input, name: '   ' }, { ...input, slug: 'shop\n' }, {},
]) {
  test(`rejects invalid create input ${JSON.stringify(payload)}`, async t => {
    const response = await request(t, {}, { payload });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'VALIDATION_FAILED');
  });
}

test('normalizes names before validation and handler execution', async t => {
  const response = await request(t, { handlers: {
    'HTTP-01': async req => ({ body: { ...shop, name: req.body.name } }),
  } }, { payload: { ...input, name: '  Shop  ' } });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().name, 'Shop');
});

for (const suffix of ['?extra=yes', '?extra=a&extra=b']) {
  test(`rejects undeclared query ${suffix}`, async t => {
    const response = await request(t, {}, { url: url + suffix });
    assert.equal(response.statusCode, 400);
  });
}

for (const [payload, headers, status, code] of [
  ['{', { 'content-type': 'application/json' }, 400, 'MALFORMED_JSON'],
  ['x'.repeat(17000), { 'content-type': 'application/json' }, 413, 'BODY_TOO_LARGE'],
  ['hello', { 'content-type': 'text/plain' }, 415, 'UNSUPPORTED_MEDIA_TYPE'],
]) {
  test(`maps transport error ${code} without reflecting input`, async t => {
    const response = await request(t, {}, { payload, headers });
    assert.equal(response.statusCode, status);
    assert.equal(response.json().error.code, code);
    assert.equal(response.headers['cache-control'], 'no-store');
  });
}

for (const [authenticate, verifyCsrf, expected, events] of [
  [false, true, 401, ['auth']],
  [true, false, 403, ['auth', 'csrf']],
  [true, true, 201, ['auth', 'csrf', 'handler']],
]) {
  test(`session/CSRF hooks gate handler: ${expected}`, async t => {
    const seen = [];
    const response = await request(t, {
      authenticate: async () => { seen.push('auth'); return authenticate; },
      verifyCsrf: async () => { seen.push('csrf'); return verifyCsrf; },
      handlers: { 'HTTP-01': async () => { seen.push('handler'); return { body: shop }; } },
    });
    assert.equal(response.statusCode, expected);
    assert.deepEqual(seen, events);
  });
}

for (const body of [{ ...shop, secret: 'private' }, { ...shop, id: 123 }, 'private', null]) {
  test(`rejects invalid provider projection ${JSON.stringify(body)}`, async t => {
    const response = await request(t, { handlers: { 'HTTP-01': async () => ({ body }) } });
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.json(), { error: { code: 'INTERNAL_ERROR', message: 'Request failed.' } });
    assert.ok(!response.body.includes('private'));
  });
}

test('unexpected exceptions do not leak their messages', async t => {
  const response = await request(t, { handlers: { 'HTTP-01': async () => { throw new Error('secret'); } } });
  assert.equal(response.statusCode, 500);
  assert.ok(!response.body.includes('secret'));
});

const draft = { title: 'Product', description: '  preserved\n', price: { amountMinor: 100, currency: 'EUR' } };
const product = { id, tenantId: id, shopId: id, status: 'draft', ...draft };
const publicProduct = { id, ...draft };
const session = { principal: { id }, csrfToken: 'synthetic', absoluteExpiresAt: '2026-09-11T20:00:00Z' };
const outputs = {
  Shop: shop, DraftProduct: product, MerchantProduct: product,
  PublishedProduct: { ...product, status: 'published' }, PublicProduct: publicProduct,
  PublicProductList: { items: [publicProduct] }, AuthorizedShopList: { items: [shop] },
  TenantMembershipList: { items: [{ tenantId: id, name: 'Tenant', role: 'owner', canCreateShop: true }] },
  SessionView: session,
};
const inputs = { CreateShopInput: input, DraftInput: draft, EmptyObject: {} };
const operationUrl = op => op.path.replace(/\{shopSlug\}/g, 'shop').replace(/\{\w+\}/g, id)
  + (op.id === 'ID-02' ? '?state=synthetic&code=synthetic' : '');

test('all 13 manifest operations bind and serialize their declared success shape', async t => {
  const handlers = Object.fromEntries(manifest.operations.map(op => [op.id, async () => ({
    body: outputs[op.success.bodySchema],
    ...(op.successHeaders ? { headers: { Location: '/synthetic-test-target' } } : {}),
  })]));
  const app = createHarness({ handlers, authenticate: async () => true, verifyCsrf: async () => true });
  t.after(() => app.close());
  for (const op of manifest.operations) {
    const response = await app.inject({ method: op.method, url: operationUrl(op),
      ...(op.bodySchema ? { payload: inputs[op.bodySchema] } : {}) });
    assert.equal(response.statusCode, op.success.status, op.id + ': ' + response.body);
    if (op.success.bodySchema) assert.deepEqual(response.json(), outputs[op.success.bodySchema], op.id);
    else assert.equal(response.body, '', op.id);
    if (op.successHeaders) assert.equal(response.headers.location, '/synthetic-test-target');
    assert.equal(response.headers['cache-control'], 'no-store');
  }
});

test('draft validation preserves description, trims title, rejects nested extras and numeric strings', async t => {
  const op = manifest.operations.find(op => op.id === 'HTTP-02');
  const app = createHarness({ authenticate: async () => true, verifyCsrf: async () => true,
    handlers: { 'HTTP-02': async req => ({ body: { ...product, ...req.body }, headers: { Location: '/synthetic' } }) } });
  t.after(() => app.close());
  const good = await app.inject({ method: op.method, url: operationUrl(op), payload: { ...draft, title: '  Product  ' } });
  assert.equal(good.statusCode, 201);
  assert.deepEqual(good.json(), product);
  for (const price of [{ ...draft.price, extra: 1 }, { ...draft.price, amountMinor: '100' },
    { ...draft.price, amountMinor: -1 }]) {
    const bad = await app.inject({ method: op.method, url: operationUrl(op), payload: { ...draft, price } });
    assert.equal(bad.statusCode, 400);
    assert.equal(bad.json().error.code, 'VALIDATION_FAILED');
  }
});

test('public route is anonymous and rejects nested private projections', async t => {
  let leak = false;
  const app = createHarness({ authenticate: async () => { throw new Error('must not authenticate'); },
    handlers: { 'HTTP-06': async () => ({ body: { items: [leak ? { ...publicProduct, tenantId: id } : publicProduct] } }) } });
  t.after(() => app.close());
  const url = '/api/v1/public/shops/shop/products';
  assert.equal((await app.inject(url)).statusCode, 200);
  leak = true;
  const bad = await app.inject(url);
  assert.equal(bad.statusCode, 500);
  assert.ok(!bad.body.includes('tenantId'));
});

test('calendar-invalid session timestamp and wrong publication state fail before serialization', async t => {
  for (const [operationId, body] of [
    ['ID-03', { ...session, absoluteExpiresAt: '2026-02-30T20:00:00Z' }],
    ['HTTP-05', product],
  ]) {
    const op = manifest.operations.find(op => op.id === operationId);
    const response = await request(t, { handlers: { [operationId]: async () => ({ body }) } },
      { method: op.method, url: operationUrl(op), payload: op.bodySchema ? {} : undefined });
    assert.equal(response.statusCode, 500);
  }
});

test('callback ambiguity and repeated code map to LOGIN_RESPONSE_INVALID', async t => {
  for (const query of ['state=s&code=a&error=e', 'state=s&code=a&code=b', 'code=a']) {
    const response = await request(t, {}, { method: 'GET', url: '/api/v1/auth/callback?' + query, payload: undefined });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'LOGIN_RESPONSE_INVALID');
  }
});

test('only operation-declared errors may reach the client', async t => {
  for (const [code, expected] of [['SLUG_UNAVAILABLE', 409], ['PRODUCT_IMMUTABLE', 500]]) {
    const response = await request(t, { handlers: { 'HTTP-01': async () => { throw new ContractError(code); } } });
    assert.equal(response.statusCode, expected);
    assert.equal(response.json().error.code, expected === 500 ? 'INTERNAL_ERROR' : code);
  }
});

test('missing redirect Location and unexpected no-body output fail closed', async t => {
  for (const result of [{}, { body: 'private', headers: { Location: '/synthetic' } }]) {
    const response = await request(t, { handlers: { 'ID-01': async () => result } },
      { method: 'GET', url: '/api/v1/auth/login', payload: undefined });
    assert.equal(response.statusCode, 500);
  }
});

test('default gates deny protected operations and invalid identifiers fail validation', async t => {
  const app = createHarness();
  t.after(() => app.close());
  assert.equal((await app.inject('/api/v1/auth/session')).statusCode, 401);
  const bad = await request(t, {}, { url: '/api/v1/merchant/tenants/not-a-uuid/shops' });
  assert.equal(bad.statusCode, 400);
});
