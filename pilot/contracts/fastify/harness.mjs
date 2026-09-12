import Fastify from 'fastify';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';

const bundle = JSON.parse(readFileSync(new URL('../schemas/wire.schema.json', import.meta.url)));
export const manifest = JSON.parse(readFileSync(new URL('../operations/http.json', import.meta.url)));
const ref = name => ({ $ref: `${bundle.$id}#/definitions/${name}` });

export class ContractError extends Error {
  constructor(code) { super('Request failed.'); this.contractCode = code; }
}

// Conformance laboratory only. Injected handlers/gates are synthetic, not identity
// or commerce implementations. No listener, database, cookies or provider client.
export function createHarness({ handlers = {}, authenticate = async () => false,
  verifyCsrf = async () => false } = {}) {
  const options = { coerceTypes: false, removeAdditional: false, useDefaults: false };
  const app = Fastify({ bodyLimit: manifest.bodyLimitBytes,
    ajv: { customOptions: options } });
  app.addSchema(bundle);
  // strict:false permits legal draft-07 conditional/allOf subschemas without
  // repeating parent types; it does NOT relax payload additionalProperties.
  const validator = addFormats(new Ajv({ ...options, strict: false }));
  validator.addSchema(bundle);
  const outputs = new Map();
  for (const name of Object.keys(bundle.definitions)) outputs.set(name, validator.compile(ref(name)));

  app.addHook('onSend', async (_req, reply, payload) => {
    reply.header('cache-control', manifest.cacheControl);
    return payload;
  });
  app.setErrorHandler((error, req, reply) => {
    const op = req.routeOptions.config.operation;
    const transportCodes = {
      FST_ERR_CTP_INVALID_JSON_BODY: 'MALFORMED_JSON',
      FST_ERR_CTP_EMPTY_JSON_BODY: 'MALFORMED_JSON',
      FST_ERR_CTP_BODY_TOO_LARGE: 'BODY_TOO_LARGE',
      FST_ERR_CTP_INVALID_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
    };
    let code = error instanceof ContractError ? error.contractCode : transportCodes[error.code];
    if (error.validation) code = error.validationContext === 'querystring'
      ? (op?.queryValidationError ?? 'VALIDATION_FAILED') : 'VALIDATION_FAILED';
    if (!op?.errorCodes.includes(code)) code = 'INTERNAL_ERROR';
    reply.code(manifest.errorStatusByCode[code]).send({ error: { code, message: 'Request failed.' } });
  });

  for (const op of manifest.operations) {
    const response = {};
    if (op.success.bodySchema) response[op.success.status] = ref(op.success.bodySchema);
    for (const code of op.errorCodes) response[manifest.errorStatusByCode[code]] = ref(manifest.errorSchema);
    app.route({
      method: op.method, url: op.path.replace(/\{(\w+)\}/g, ':$1'),
      config: { operation: op },
      schema: { params: ref(op.paramsSchema), querystring: ref(op.querySchema),
        ...(op.bodySchema ? { body: ref(op.bodySchema) } : {}), response },
      preValidation: async req => {
        if (op.bodySchema && req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
          throw new ContractError('UNSUPPORTED_MEDIA_TYPE');
        }
        if (op.authentication === 'session') {
          if (!await authenticate(req, op)) throw new ContractError('AUTHENTICATION_REQUIRED');
          if (op.csrfRequired && !await verifyCsrf(req, op)) throw new ContractError('CSRF_REJECTED');
        }
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
          for (const key of ['name', 'title']) {
            if (typeof req.body[key] === 'string') req.body[key] = req.body[key].trim();
          }
        }
      },
      handler: async (req, reply) => {
        if (!handlers[op.id]) throw new ContractError('INTERNAL_ERROR');
        const result = await handlers[op.id](req);
        if (!result || (op.success.bodySchema
          ? !outputs.get(op.success.bodySchema)(result.body)
          : result.body !== undefined)) throw new ContractError('INTERNAL_ERROR');
        // Check the original projection BEFORE Fastify's serializer can strip
        // unknown fields or coerce output. Covers strings/null too.
        for (const header of Object.keys(op.successHeaders ?? {})) {
          if (typeof result.headers?.[header] !== 'string' || !result.headers[header]) {
            throw new ContractError('INTERNAL_ERROR');
          }
        }
        reply.code(op.success.status);
        if (result.headers) reply.headers(result.headers);
        return reply.send(result.body);
      },
    });
  }
  return app;
}
