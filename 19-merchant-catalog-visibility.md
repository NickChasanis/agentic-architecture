# Merchant Catalog Visibility Implementation Roadmap

> **For agentic workers:** Use `superpowers:executing-plans` for task-by-task execution after a current coordinator grant. This roadmap does not dispatch workers. Prepare the detailed test-first implementation packet for each step before editing application code.

**Goal:** Let an authorized merchant browse a shop's draft and published products without changing public visibility or published-product immutability.

**Architecture:** Extend the existing catalog provider with a merchant-only read operation. The Angular merchant application consumes the declared response contract; it never reads catalog storage directly. Existing session, tenant membership and shop access checks remain authoritative.

**Tech stack:** Existing TypeScript, Fastify, PostgreSQL, Angular and Playwright toolchain; no new dependencies planned.

Status: provider and basic consumer implemented on main revision `4d9dd08` (2026-09-13). Provider review was recorded. Subsequent source inspection found incomplete browser coverage and session/request lifecycle gaps; MC-06/07 acceptance is reopened in [chapter 20](20-catalog-reliability-and-coordination-recovery.md). The earlier broad completion claim is superseded by this qualification.

## Scope and sequence

| Step | Deliverable | Depends on | Exit gate |
|---|---|---|---|
| 1. Merchant list contract and provider | Authenticated, shop-scoped list API and executable obligations | Current authority, checkout and local test resources revalidated | Schema, provider and connected authorization checks pass |
| 2. Merchant list consumer | Read-only list and status filter in the merchant application | Step 1 contract and API verified | Consumer validation, build and browser scenarios pass |
| 3. Integrated acceptance and handoff | Combined-revision evidence, extension assessment and updated usage documentation | Steps 1 and 2 integrated | All mandatory checks pass; limitations and remaining work recorded |

No product edit/refactor feature, checkout, billing, new identity provider, durable coordinator, paid model run or concurrency benchmark is included. Published products remain immutable. The coordination and recovery tracks remain open beyond this slice.

## Step 1 — Merchant list contract and provider

Implemented in `64bf29a` with follow-up contract/test coverage `239bcf2`. Fresh-database setup ordering was corrected so shop composite uniqueness exists before catalog foreign keys.

Start from the canonical board in the originating checkout. Record the exact baseline, UTC validation time, task packet revision, owner, owned paths, generation and test resources before an implementation grant. Use the established troubleshooting limits: 90 active worker minutes, checkpoints every 15 minutes and a 30-minute coordinator/review threshold before escalation. An expired historical grant cannot authorize this work.

Proposed operation: `GET /api/v1/merchant/shops/:shopId/products`, with optional `status=draft|published`; omission returns both states. Return `{ "items": [...] }`, using the existing merchant product shapes. Unknown query fields and invalid status values are rejected. Preserve existing error-envelope and authorization conventions: unauthenticated requests return 401; unavailable or inaccessible shops return the same resource-not-found behavior. Authenticate and authorize the shop before returning an empty list.

For the bounded local pilot, return all matching products ordered by product ID ascending. Do not silently truncate. Pagination and production-volume suitability are not promised by this slice; adding pagination later requires explicit consumer obligations.

Files to inspect and update:

- `contracts/commerce-http-api.md`: operation, errors, filtering and compatibility requirements.
- `pilot/contracts/schemas/wire.schema.json`: list response and query definitions using existing product definitions.
- `pilot/contracts/operations/http.json`: additive operation mapping; do not renumber existing operation IDs.
- `pilot/contracts/check_contracts.py` and `pilot/contracts/fastify/`: manifest/schema and synthetic adapter cases.
- `pilot/modules/catalog/service.ts`: shop-scoped merchant list query and projection.
- `pilot/apps/api/app.ts`: operation dispatch using the existing access boundary.
- `pilot/tests/integration/catalog.test.ts` and `pilot/tests/integration/access.test.ts`: real database/API behavior and access checks.

Execution checklist:

- [ ] Freeze obligation IDs and exact request/response examples in the task packet; review compatibility with existing consumers.
- [ ] Add failing schema/provider and connected integration cases for MC-01–05 below; confirm failures reflect missing behavior rather than unavailable infrastructure.
- [ ] Implement the smallest additive provider change, using parameterized SQL and the existing merchant projection.
- [ ] Run offline, contract, TypeScript and connected integration checks. Preserve public privacy and publication regression coverage.
- [ ] Submit an immutable revision and check evidence; coordinator reviews before step 2 begins.

Exit gate: authorized empty-shop reads succeed, draft/published filtering works, invalid queries fail, and cross-shop/tenant access cannot disclose rows or shop existence. Schema checks alone do not close this gate.

## Step 2 — Merchant list consumer

Implemented in `4d9dd08`; the consumer loads the selected shop and validates the declared list response. Loading/empty/error/retry rendering and some stale-list guards exist, but session side effects and late mutation responses need further protection and tests under chapter 20.

Files: `pilot/apps/merchant-admin/src/main.ts`, `pilot/apps/merchant-admin/src/contracts.ts`, and `pilot/tests/e2e/merchant-foundation.spec.ts`. Keep the UI change bounded; do not reorganize unrelated application code.

Show the selected shop's products with title, status and price. Provide an accessible status selector with All, Draft and Published options. Include loading, empty and failure states plus an explicit retry action. Reuse existing response validation and error handling.

Clear the previous list when switching shop/tenant, losing the session or logging out. Discard responses belonging to an earlier selection or filter request, including delayed failures. Refresh the active list after successful create/publication; a draft-only filter must stop showing a product after publication. Do not add editing controls or change mutation contracts.

- [ ] Add failing consumer/browser checks for rendering, filters, empty/error states and a delayed response arriving after shop selection changes.
- [ ] Connect list requests to current selection and validate responses through the canonical schema.
- [ ] Implement list states and stale-response protection; preserve the existing publication journey.
- [ ] Run TypeScript, merchant build and Playwright checks against the disposable local stack.
- [ ] Submit the consumer artifact and evidence for coordinator review.

Exit gate: a real merchant session can see both product states and filter them, while stale responses cannot repopulate a previous shop's data. Mocked network timing can exercise response races, but must be reported separately from real provider journeys.

## Step 3 — Integrated acceptance and handoff

Basic integration was recorded; complete interaction acceptance remains open under chapter 20. The five browser journeys do not verify every MC-06/07 obligation.

Run checks on the combined revision, not only the two submitted artifacts. Review requirements separately from implementation choices. Do not label coordinator self-review as an independent agent review.

| Obligation | Observable evidence |
|---|---|
| MC-01 | Authorized owner and granted staff see only the selected shop's matching products; deterministic ordering and valid empty results. |
| MC-02 | Missing sessions, foreign-tenant shops, ungranted shops and revoked access cannot retrieve the list. |
| MC-03 | Omitted/draft/published filters behave as specified; invalid and unknown query values fail. |
| MC-04 | Public reads still omit drafts and merchant-only fields; published mutation remains rejected. |
| MC-05 | List responses validate against declared schemas, including zero prices and mixed draft/published products. |
| MC-06 | Browser loading, empty, error, retry and status-filter states work; stale responses are ignored after selection/session changes. |
| MC-07 | Create/publish refresh produces the correct visible list without changing existing publication semantics. |
| MC-08 | A test-only second consumer can count draft/published items from the declared response without database access or provider changes. |

MC-08 measures one concrete extension, not general adaptability. Record changed paths and any producer/contract changes it required. Retain failures and corrective work in the evaluation.

Planned commands, from the repository root:

```bash
python3 pilot/contracts/check_contracts.py
cd pilot
npx tsc --noEmit
npm run check:boundaries
npm run check:provider
npm run test:contracts
npm run test:coordination
npm run test:consumers
npm run test:adapters
npm run test:registry
npm run test:integration
npm run build:merchant
npm run test:e2e
```

These commands describe the verification workflow; historical results are recorded below. They were not rerun during the chapter 20 planning review. Provider, integration and browser checks require the documented disposable local services and certificate. Revalidate their availability before implementation. Missing infrastructure is not a passing result and does not authorize changes to another running environment.

- [x] Execute the mandatory gates and associate results with the exact combined source revision and environment.
- [ ] Finish MC-06/07 failure/race coverage and reconcile the evidence record before closing all obligations.
- [ ] Record elapsed time, available active effort, review intervention and changed paths. Mark unavailable model cost explicitly; do not claim comparative savings from this slice.
- [x] Update this chapter, `README.md`, `howtouse.md`, `pilot/README.md` and the canonical board with actual results and remaining limits.
- [x] Write a fresh-session handoff identifying accepted artifacts, rerun commands and the next unresolved work. Commit the reviewed slice; publish only under the owner's applicable release authority.

Observed verification on 2026-09-13: 30 contract tests, 29 connected integration tests and 5 Playwright journeys passed. Provider, boundary, TypeScript and merchant build checks passed; Angular reports existing Ajv CommonJS optimization warnings. The slice remains unpaginated and local-pilot scoped. No model speed/cost/concurrency claim was measured; durable coordination and restart adoption remain open.

Completion means a verified merchant-list journey and its documented handoff. It does not mean the broader concurrency comparison or restart-safe coordinator is complete.
