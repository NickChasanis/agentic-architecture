# Machine-readable pilot contracts

Status: `0.1-draft`, created 2026-09-11. These artifacts encode the current proposals; they are not an accepted worker baseline or implemented commerce API. The pilot contains contracts, offline checks, and a test-only Fastify conformance harness.

- [Wire schema bundle](schemas/wire.schema.json): 31 named JSON Schema draft-07 definitions for inputs, outputs, parameters, errors, and callback query shape.
- [HTTP operation manifest](operations/http.json): 15 commerce/identity mappings with method/path, named schemas, authentication/CSRF requirements, error codes/statuses, and acceptance IDs.
- [Offline checks](check_contracts.py): validates schema syntax, manifest links/invariants, and 88 positive/negative payload cases.
- [Fastify conformance harness](fastify/README.md): 28 tests with real in-process request validation and serialization, using synthetic handlers and identity gates.
- [Behavioral context](../../contracts/README.md): authorization, lifecycle, concurrency, privacy, and integration obligations that shape validation alone cannot establish.

## How to use the schemas

The bundle root is a definition catalog, not a payload schema. Select `#/definitions/<Name>` for validation, retaining the bundle definitions for local reference resolution. Manifest schema names resolve to those definitions; null body schemas mean no HTTP body, not a JSON `null` payload. No external schema resolution or network access is needed by the offline checker.

Use draft-07 consistently in the first implementation. The Python check uses the installed `jsonschema` package and alone does not prove Fastify/Ajv compatibility; the separate harness now exercises the selected JavaScript dependency set. JSON Schema's validation keywords define structural constraints; format enforcement must be enabled and verified separately. Sources: [draft-07 validation](https://json-schema.org/draft-07/draft-handrews-json-schema-validation-01), [jsonschema validation documentation](https://python-jsonschema.readthedocs.io/en/stable/validate/).

Request schemas reject unknown fields, including nested objects, and do not authorize type coercion or removal of additional fields. The adapter must trim string-valued `name`/`title` before schema validation, preserve description, and reject invalid original types. Schema checks do not perform that normalization. Canonical slug/UUID patterns reject trailing newlines. UTC output timestamps use full `T...Z` notation with optional fractional seconds; calendar checking is required. Leap-second serialization is outside this pilot timestamp profile.

Provider response checks use the closed schemas to catch unintended fields, including private catalog/session data. Do not rely solely on a serializer that strips extra fields: check the actual projection before serialization as well as the wire response. For consumer compatibility checks, derive a response-only view that permits additional object properties while preserving required fields, types, formats, and constraints. The offline checker demonstrates that derivation without maintaining a duplicate editable schema. Never apply it to requests or provider privacy checks.

The OIDC callback query intentionally permits provider extension parameters as single strings, unlike the closed application query schemas. It requires state and exactly one of code/error, but shape validation does not establish transaction matching, token validity, replay protection, or protocol security. Those remain library/runtime obligations.

The operation manifest is a project-specific mapping, not an OpenAPI document or a running router. Authentication and CSRF flags are requirements for adapters, not enforcement. Error body schema validation and operation-specific code/status validation must both occur when integrating actual responses. The checker verifies the manifest's code/status references but does not exercise a live response.

## Run the offline checks

From the repository root, with Python 3 and `jsonschema` available:

```bash
python3 pilot/contracts/check_contracts.py
```

Verified locally with Python's installed `jsonschema` 4.19.2; no package was installed for this work. The checker explicitly supplies calendar-date validation because optional format-check dependencies may be absent. Use this exact non-optimized invocation: Python `-O` disables assertion-based manifest checks. The application toolchain/version selection remains a separate step.

Observed result on 2026-09-11:

```text
PASS: 31 schema definitions, 15 operation mappings, 88 payload cases.
Scope: offline payload/manifest checks only; no HTTP, authorization, OIDC, database or browser checks.
```

The cases include missing fields, wrong types, numeric boundaries, Unicode title limits, unknown nested fields, public/session leaks, wrong publication states, capability inconsistencies, invalid dates, callback ambiguity, and tolerant-consumer additions. Initial checks exposed trailing-newline acceptance in identifier patterns and missing calendar-format enforcement; both were corrected before this recorded run.

These results do not prove token validation, membership lookup, claim atomicity, publication transactions, next-read visibility, sorting, uniqueness, header behavior, or any PUB/AUTH/WORK runtime scenario. The coordination assignment/result protocol remains prose; this batch covers the commerce and identity HTTP surfaces only.

## Next implementation gate

The first Fastify check now covers strict validation, normalization, response projection, error mapping, and synthetic authentication/CSRF hook order. Next, review draft defaults/provider direction and obtain independent contract review before feature modules. Real session/resource authorization, provider transactions, database publication behavior, and browser journeys remain separate gates. Execution budgets and actual worker assignments remain open.
