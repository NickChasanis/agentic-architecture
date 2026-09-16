# Fastify adapter conformance laboratory

Coordinator-authored checkpoint, verified 2026-09-12. This is **not the commerce backend**, a working login system, or an accepted worker baseline. No listener is started. Tests call real Fastify `inject()` and use synthetic handlers/gates instead of domain services.

## Reproduce

From the repository root, with Node 22+ and npm:

```bash
npm --prefix pilot ci --ignore-scripts
npm --prefix pilot run test:contracts
python3 pilot/contracts/check_contracts.py
```

The lockfile pins the resolved tree. Locally exercised with Node 22.21.1, npm 11.19.0, Fastify 5.12.4, Ajv 8.20.0 and ajv-formats 3.0.1. These are harness versions, not an approved production toolchain.

Observed: **28 Node tests pass**, including a table-driven success check for all 15 operation mappings; **88 Python payload cases pass**. Counts describe different checks, not complete coverage of every scenario. Initial test-first run: 20 behavioral tests failed against the empty Fastify adapter (404 responses); those 20 passed after wiring the adapter, then eight broader regression tests were added.

## What is exercised

| Boundary | Evidence |
|---|---|
| Schema binding | All 15 operation paths, methods, and success shapes compile and pass through Fastify serialization. |
| Input | Unknown properties are rejected instead of removed; wrong types are rejected instead of coerced; names/titles trim, description stays unchanged; invalid nested prices, IDs and queries fail. |
| Output | Ajv validates the handler projection before serialization, including null/string outputs and nested private fields. Invalid dates and publication-state shapes fail closed. |
| Transport/errors | Malformed JSON, body limit, unsupported media type, declared error/status mapping, generic unexpected errors, and no-store headers are checked. |
| Identity boundary wiring | Injected session gate runs before CSRF and handler; either gate can deny execution; public reads bypass the session gate. Callback shape rejects ambiguous/repeated code. |
| No-body/header shape | Empty redirect/logout bodies and presence of required Location headers are checked. |

[harness.mjs](harness.mjs) reads the canonical [manifest](../operations/http.json) and [schema bundle](../schemas/wire.schema.json); [harness.test.mjs](harness.test.mjs) supplies explicitly synthetic projections. No second editable schema contract was introduced.

Fastify's validator and serializer are distinct paths; the independent projection check prevents a serializer from silently stripping unexpected fields. See [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/). Output Ajv uses `strict: false` for legal conditional/allOf schema fragments while retaining all payload constraints and disabling coercion/defaults/property removal. The serializer currently emits non-fatal `strictTypes` warnings for those fragments; they are visible, not suppressed. All response assertions still pass.

## Proof boundaries and next gate

- Synthetic gates prove hook ordering, **not** session authenticity, CSRF security, tenant/shop authorization, cookie policy, revocation, or OIDC transaction verification. Identity redirects use a synthetic target; only header presence is tested, not destination safety or correctness.
- Synthetic products prove wire compatibility, **not** publication transactions, immutability enforcement, concurrent writes, next-read visibility, sorting, or tenant isolation. No PostgreSQL, Keycloak, Angular, Playwright/browser, or network listener is involved.
- Consumer-addition tolerance remains demonstrated by the Python checker; no real second client or measured extension exercise exists yet.
- The harness owns replies and accepts handler projections; it does not prove arbitrary future Fastify handlers cannot bypass those safeguards. Production adapter reuse requires an explicit design/review decision.
- No model affordability benchmark, paid API run, worker assignment, or cross-agent coordination test occurred. The board remains draft with generation zero.

Next: independent contract review and resolution of draft identity/default choices, followed by a bounded real identity/tenancy foundation slice. Keep budget/assignment gates separate from local deterministic harness evidence. Multi-agent refactoring remains deferred.
