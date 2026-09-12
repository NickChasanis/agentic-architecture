# Commerce HTTP API — 0.2-draft

Recorded 2026-09-11T16:16:51Z. This is the proposed wire specification for [COMMERCE-PUBLICATION](commerce-publication.md), using the accepted Angular/TypeScript/Fastify/PostgreSQL direction. Routes, limits, currency, and concurrency defaults remain proposals. [Canonical draft schemas and mappings](../pilot/contracts/README.md) now encode these definitions; no endpoints exist yet.

## Common rules

- API prefix: `/api/v1`. Request/response bodies use JSON; timestamps, when introduced, use UTC. Client routes are separate from API routes.
- Resource IDs are lowercase canonical UUID strings, issued by the server and treated as opaque by clients. Examples use illustrative IDs, not real records.
- Reject unknown request fields, malformed JSON, wrong primitive types, and out-of-range values; do not coerce strings to numbers or silently remove unknown keys. All input objects are closed, including nested price objects.
- Success objects contain only their declared fields. Consumers tolerate unknown response properties for compatible additions, but validate all required fields and values. Explicit privacy tests check the provider's public allowlist even though consumers tolerate additions.
- Proposed body limit: 16 KiB for JSON mutations. Do not reflect submitted content, secrets, SQL errors, or stack traces in error messages.
- Merchant endpoints require an authenticated principal. The [identity/access draft](identity-and-access.md) proposes backend OIDC login, an application-session cookie, and CSRF/origin checks on mutations; acceptance and provider selection remain open. No endpoint accepts a tenant or principal header as proof of identity.
- Public and merchant responses use `Cache-Control: no-store` for the first pilot, and application-level catalog caching is omitted. Adding caching later must preserve next-read publication visibility.

## Payload definitions

All fields below are required unless explicitly marked optional. String limits are Unicode code-point counts; identifiers/slugs are ASCII. Reject all-whitespace names/titles rather than accepting empty-looking content; trim leading/trailing whitespace for names/titles before length validation and persistence. Description is preserved as plain text.

| Type | Exact proposed fields |
|---|---|
| CreateShopInput | `name`: string, 1–80 code points after trim; `slug`: 3–48 characters matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. |
| Shop | `id`: UUID; `tenantId`: UUID; `name`: normalized name; `slug`: globally unique stable slug. |
| Price | `amountMinor`: integer 0–100000000 inclusive; `currency`: literal `EUR`. The limit is a pilot validation bound, not an economic recommendation. |
| DraftInput | `title`: string, 1–120 code points after trim; `description`: string, 0–2000 code points; `price`: Price. |
| MerchantProduct | `id`, `tenantId`, `shopId`: UUIDs; `status`: `draft` or `published`; `title`, `description`, `price` as above. |
| PublicProduct | Exactly `id`, `title`, `description`, `price`; no tenant/shop ownership fields, membership, internal status, or audit metadata. |
| PublicProductList | `items`: array of PublicProduct, ordered by `id` ascending; empty array for a known shop with no published products. |

No arbitrary HTML, assets, inventory, taxes, discounts, or multi-currency conversion are included. Scope for the measured pilot is a small bounded fixture set; list responses are unpaginated and never silently truncated. Before accepting this as a production-facing API, define a capacity/pagination contract. Shop slug changes and deletion are out of scope.

## Operation table

All errors use the common envelope below. Merchant resource errors must conceal inaccessible existence.

| ID | Method and path | Request | Success | Operation-specific outcomes |
|---|---|---|---|---|
| HTTP-01 | `POST /api/v1/merchant/tenants/{tenantId}/shops` | CreateShopInput | `201`, Shop | `404 RESOURCE_NOT_FOUND` for missing/inaccessible tenant; `409 SLUG_UNAVAILABLE` for unavailable slug. |
| HTTP-02 | `POST /api/v1/merchant/shops/{shopId}/products` | DraftInput | `201`, MerchantProduct in draft state | `404 RESOURCE_NOT_FOUND` for missing/inaccessible shop. |
| HTTP-03 | `GET /api/v1/merchant/shops/{shopId}/products/{productId}` | No body | `200`, MerchantProduct | `404 RESOURCE_NOT_FOUND` for missing, wrong-shop, or inaccessible product. Supports UI reload and state recovery. |
| HTTP-04 | `PUT /api/v1/merchant/shops/{shopId}/products/{productId}` | Complete DraftInput; replacement of editable fields | `200`, MerchantProduct in draft state | `404 RESOURCE_NOT_FOUND`; `409 PRODUCT_IMMUTABLE` when authorized product is already published. |
| HTTP-05 | `POST /api/v1/merchant/shops/{shopId}/products/{productId}/publish` | Empty JSON object `{}` | `200`, MerchantProduct in published state | `404 RESOURCE_NOT_FOUND`; repeated publication also returns `200` and the same immutable product. |
| HTTP-06 | `GET /api/v1/public/shops/{shopSlug}/products` | No body | `200`, PublicProductList | `404 RESOURCE_NOT_FOUND` for unknown public shop. |
| HTTP-07 | `GET /api/v1/public/shops/{shopSlug}/products/{productId}` | No body | `200`, PublicProduct | `404 RESOURCE_NOT_FOUND` for unknown shop, draft, missing product, or wrong-shop product. |

HTTP-02 includes a `Location` identifying the created product through HTTP-03. HTTP-01 returns its Shop body without a `Location` header; a shop detail-read operation is outside this draft and must be specified if a consumer needs it.

The [identity/access draft](identity-and-access.md) now specifies login/session, tenant discovery, and authorized shop-list operations. Consume that shared foundation contract rather than inventing selection endpoints independently. Fixture setup must not be presented as a full account-management implementation.

## Error envelope and precedence

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed.",
    "fields": [
      { "path": "/price/amountMinor", "code": "OUT_OF_RANGE" }
    ]
  }
}
```

`code` and `message` are required strings. `fields` is optional and appears only for validation failures; it contains JSON-pointer paths into input and codes from `REQUIRED`, `TYPE`, `FORMAT`, `OUT_OF_RANGE`, or `UNKNOWN_FIELD`. Never include rejected values. Consumers branch on codes, not message wording. Tests for inaccessible resources compare the same status, code, and generic message as a missing resource.

| HTTP status | Error code | Condition |
|---|---|---|
| 400 | `MALFORMED_JSON` | Body is not parseable JSON. |
| 400 | `VALIDATION_FAILED` | Invalid body/path/query shape or unsupported query parameter. |
| 401 | `AUTHENTICATION_REQUIRED` | Merchant operation lacks a valid principal. Authentication scheme/header details await foundation selection. |
| 403 | `CSRF_REJECTED` | Authenticated mutation lacks the required session-bound CSRF token or accepted origin, under the identity/access proposal. |
| 404 | `RESOURCE_NOT_FOUND` | Resource unavailable under the operation's visibility/authorization rules. |
| 409 | `SLUG_UNAVAILABLE` | Requested slug cannot be assigned; no owner details disclosed. |
| 409 | `PRODUCT_IMMUTABLE` | Authorized caller tries to modify published content. |
| 413 | `BODY_TOO_LARGE` | Request exceeds the body limit. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Mutation body is not supported JSON media type. |
| 500 | `INTERNAL_ERROR` | Unexpected server error with a generic public message. |
| 503 | `SERVICE_UNAVAILABLE` | Temporary inability to complete the operation. |

Transport-level parsing/size checks may reject before authentication. After basic request parsing, resolve authentication, CSRF/origin checks for mutations, and resource access before exposing resource-state-specific errors. Unknown, wrong-shop, and unauthorized products cannot yield `PRODUCT_IMMUTABLE`. Exact Fastify hook/error mapping must preserve this order and normalize framework errors to the envelope; verify it against the chosen version. The identity contract owns login-specific errors.

## Atomicity, concurrency, and retries

Draft updates and publication of one product must serialize on that product's state. The state check and mutation occur atomically: if publish wins, a competing edit fails with `PRODUCT_IMMUTABLE`; if edit wins, publication sees and publishes the updated complete content. No partial field combination or post-publication edit is allowed.

For two competing draft edits, the proposed pilot policy is last committed replacement wins. No optimistic-edit token is promised by this draft. This is an explicit limitation to review before implementation, not a reason to add multi-agent refactoring or product version-history scope now.

Publish returns success only after durable commit. A public request begun after the success response must observe the published product through the primary read path; do not introduce a lagging read replica in the initial experiment. Concurrent/repeated publishes result in the same product, not duplicate products or duplicate declared effects.

CreateShop/CreateDraft do not promise request-idempotency. Do not automatically replay them after uncertain transport failure. Publication may be retried; a timeout can mean the mutation committed even though the response was lost. The UI should show an uncertain result, then read/retry using the existing product ID rather than creating a replacement product.

## Concrete examples

Create/update draft input:

```json
{
  "title": "Purple notebook",
  "description": "A plain-text product description.",
  "price": { "amountMinor": 1250, "currency": "EUR" }
}
```

Public detail response after publication:

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "title": "Purple notebook",
  "description": "A plain-text product description.",
  "price": { "amountMinor": 1250, "currency": "EUR" }
}
```

## Scenario traceability and remaining work

HTTP-01/02/05/06/07 support PUB-01. HTTP-03/04 support reload and draft editing; HTTP-04 also supports accepted PUB-08 immutability. HTTP-06/07 enforce PUB-02/07 and the second-consumer PUB-10. Resource checks across all operations support PUB-03. Validation maps to PUB-04; transaction/retry rules map to PUB-05/06/09.

Add provider checks for update/publish races, last-commit draft updates, strict request validation, error-envelope privacy, and location/reload consistency. These supplement the existing scenario list, not substitute for its real browser flow.

Current checkpoint: [Fastify laboratory checks](../pilot/contracts/fastify/README.md) now exercise draft schemas with synthetic handlers through in-process validation/serialization. No real identity, database, or browser integration has run. Next: resolve the [foundation-readiness findings](reviews/2026-09-12-foundation-readiness.md) and obtain independent contract review before feature implementation.
