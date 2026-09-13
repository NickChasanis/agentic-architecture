# Catalog Reliability and Coordination Recovery

[Overview](README.md) · [Usage guide](howtouse.md) · [Merchant catalog](19-merchant-catalog-visibility.md)

## Implementation roadmap

Status: implemented locally on main revision `966a8e1` (2026-09-13 UTC). This chapter records the three-step roadmap and evidence for its completed pilot slice; it does not claim production deployment or unattended authority recovery.

| Step | Track | Outcome | Exit gate |
|---|---|---|---|
| 1. Close merchant interaction and evidence gaps | Software delivery | Reliable shop/session transitions and reproducible browser evidence | MC-06/07 pass focused failure/race checks and existing journeys |
| 2. Introduce compatible catalog pagination | Software delivery | Bounded page reads and a merchant consumer that navigates them | Page contract, access isolation and old-consumer compatibility verified |
| 3. Persist coordination state and rehearse recovery | Agent coordination | Fresh coordinator can restore records and safely reconcile interrupted work | Durable receipts, single-writer checks and supervised recovery scenarios pass |

The coordinator executed these steps in order. Published-product editing and the deferred multi-agent refactoring topic remain outside this roadmap.

## Observed implementation and verification

Step 1 is complete: request generations guard selection, tenant, session, create and publish responses. Step 2 is complete: HTTP-09 is additive, keyset-paginated and context-bound while HTTP-08 remains unchanged. Step 3 is complete for the local pilot: PostgreSQL-backed grants, receipts, revisions, event sequencing and read-only recovery inspection are implemented and exercised.

Observed checks at the integrated revision: 16 Playwright tests passed, 36 integration tests passed, 12 durable-coordination tests passed, 30 contract tests passed, and the offline contract checker passed 31 schema definitions, 15 operation mappings and 88 payload cases. TypeScript, provider, boundary and merchant-build checks passed. The pagination fixture enumerated 1,000 products exactly once and logged use of the page index. These are local disposable-environment results; host reboot recovery, escaped process control, production rollout and comparative parallel-model cost/speed remain unproven.

## Baseline findings that determine the order

The merchant provider and basic UI exist. The previous run recorded five passing browser journeys, but `pilot/tests/e2e/merchant-foundation.spec.ts` has no delayed-response, error/retry or session-loss scenarios. Its filter test expects products already present in the database rather than creating its own fixtures.

In `pilot/apps/merchant-admin/src/main.ts`, `request()` clears the session on any 401 before the caller checks request freshness. `selectTenant()` does not immediately invalidate pending product requests, and product creation/publication can update the selected product after the user changes shops. These source observations justify reopening MC-06/07 acceptance. They have not been reproduced in a browser during this planning turn.

The coordination board also needs a truthful handoff record: the UI worker failed on a usage limit and the coordinator implemented the UI. Its historical running grant and broad completion wording must not be treated as evidence of worker submission or full interaction coverage.

## Step 1 — Close merchant interaction and evidence gaps

**Files:** `pilot/apps/merchant-admin/src/main.ts`, `pilot/tests/e2e/merchant-foundation.spec.ts`, chapter 19, the canonical board and usage documentation. Inspect `pilot/apps/merchant-admin/src/contracts.ts` for existing response validation; retain that boundary.

- [ ] Create isolated test fixtures for each browser journey, including one draft, one published product and an empty authorized shop. Tests must run successfully alone without earlier integration runs populating the database.
- [ ] Add failing browser cases for delayed successes and failures after shop, filter and tenant changes; a stale 401 after a newer successful selection; logout/session loss with a pending list; and a create/publish response arriving after selection changes.
- [ ] Use a request generation tied to current selection/session, invalidate it immediately on transitions, and check freshness before changing session or UI state. Clear selected-product controls, list data, errors and loading state when their context expires. Preserve current-session authentication failure handling.
- [ ] Add explicit checks for loading, empty results, failure and retry. After publication, verify the active draft-only list removes the product and the published filter includes it.
- [ ] Record coordinator takeover and review provenance. Preserve historical passes while correcting unsupported completion claims. Request independent review when a reviewer is available; otherwise report that gate as pending.

**Contract gate:** MC-06 and MC-07 need evidence at the tested revision. Delay injection tests prove client ordering behavior; real Keycloak/API/PostgreSQL journeys prove integration. Record both kinds of evidence. Measure reproducible failures fixed and review intervention, rather than just the total test count.

**Commands from `pilot/`:** `npx tsc --noEmit`, `npm run build:merchant`, `npm run test:e2e`. Run the focused cases first and the existing journeys after the fix. Use the documented disposable stack; do not reuse another project's database.

## Step 2 — Introduce compatible catalog pagination

**Files:** `contracts/commerce-http-api.md`, `contracts/acceptance-scenarios.md`, `pilot/contracts/schemas/wire.schema.json`, `pilot/contracts/operations/http.json`, `pilot/contracts/check_contracts.py`, `pilot/contracts/fastify/`, `pilot/modules/catalog/service.ts`, `pilot/apps/api/app.ts`, merchant UI files and `pilot/tests/integration/merchant-list.test.ts`.

The current HTTP-08 contract promises all matching rows. Silently making that endpoint return only a first page would violate its consumers. Implemented approach: add a distinct page endpoint, `/api/v1/merchant/shops/{shopId}/products/page`, and migrate the merchant UI to it while retaining HTTP-08's existing behavior. Static-route precedence is covered by integration tests. Retiring the old endpoint requires a separate compatibility decision.

- [ ] Freeze the additive page contract before coding: optional `status=draft|published`, proposed page size default 25 and maximum 100, and a bounded opaque cursor. Specify strict parsing of HTTP query strings and reject unknown/repeated/invalid fields. Response: `items` and nullable `nextCursor`; omit an expensive total-count promise.
- [ ] Bind cursor context to shop, filter and ordering version; reject mismatches and malformed cursors. Cursors never grant access: authenticate and authorize each page request. Define any cursor integrity requirement in the contract before choosing its encoding.
- [ ] Implement a parameterized keyset query in ID order, fetching at most the requested size plus one row to detect another page. Check the existing `(shop_id,status,id)` index and add only an index justified by measured query plans.
- [ ] Connect Next and restart navigation, resetting cursor history on shop/filter/session changes. Apply step 1's stale-response rules to page requests and reset pagination after relevant mutations.
- [ ] Test empty and final pages, boundary sizes, malformed/context-mismatched cursors, revoked access between pages, strict public privacy and unchanged HTTP-08 behavior. On a static fixture, concatenated pages must equal the full matching list exactly once and in order.

**Consistency contract:** proposed pagination reads current committed data on each request, without a snapshot across pages. Concurrent creation or publication may change membership; restart navigation to refresh. Do not promise complete enumeration during concurrent writes without implementing and testing a stronger snapshot contract.

**Exit gate:** page-size bounds, authorization on every page, static-fixture completeness and old-consumer compatibility pass. Capture query plans, response sizes and timings against recorded fixture sizes. The retained unbounded endpoint means this step alone cannot establish production readiness.

**Commands:** root `python3 pilot/contracts/check_contracts.py`; then from `pilot/`, `npm run test:contracts`, `npm run test:integration`, `npm run check:boundaries`, `npx tsc --noEmit`, `npm run build:merchant`, `npm run test:e2e`.

## Step 3 — Persist coordination state and rehearse recovery

**Existing files:** `pilot/contracts/coordination/registry.mjs`, `check-submission.mjs`, `registry.test.mjs`, `recovery.test.mjs`, `adapter.mjs`, `tmux-adapter.mjs`, and `coordination/README.md`. **Proposed new files:** `pilot/contracts/coordination/durable-registry.mjs`, `durable-registry.test.mjs`, `recovery-inspection.mjs` and `pilot/infra/coordination.sql`.

Implemented storage is a separate coordination schema in the disposable PostgreSQL instance, using the existing database dependency. It does not read commerce tables. The existing in-memory registry remains the contract reference and the durable implementation has explicit transaction/revision semantics.

- [ ] Define persisted grants, complete submission receipts, event sequence, schema version and record revision. The current event log omits full submission content and is not sufficient to reconstruct receipt deduplication by itself.
- [ ] Implement grant/submission/reassignment transactions with a database-enforced single writer and expected-revision checks. Commit state and corresponding events atomically; database failure must not produce a successful acknowledgment.
- [ ] Define a supervised authority handoff: canonical Markdown remains live authority until the owner explicitly switches to durable mode. In durable mode the board is a generated snapshot. Never operate two writable authorities or infer a transfer from files appearing in another checkout.
- [ ] Restore persisted records in a fresh process, preserving receipt IDs and generations. Mark interrupted execution as requiring reconciliation. Adapter run maps are still in memory; a restored grant is not evidence that an old process stopped or is safe to adopt.
- [ ] Exercise crash-before-commit, commit-before-acknowledgment, duplicate redelivery, competing coordinator writes, unavailable storage and stale-generation submissions. Preserve artifacts and require current process-termination evidence before a replacement grant. Unknown termination blocks reassignment.

**Exit gate:** a separate process restores the committed state, repeated delivery has one effect, concurrent writers cannot both update the same revision, and no replacement starts while old-writer termination is unresolved. Prove database persistence separately from operating-system process control. Host reboot recovery and escaped process groups remain unproven unless specifically exercised under suitable isolation.

**Commands from `pilot/`:** `node --test contracts/coordination/durable-registry.test.mjs` after the new test exists, plus `npm run test:coordination`, `npm run test:registry` and `npm run test:adapters`. Use only the isolated coordination schema and identify the exact revisions/environment in the results.

## Roles, budgets and completion records

The lead coordinator owns contracts, decomposition, grants, integration and acceptance. Assign bounded implementation or test work to lower-cost workers when available; model choice does not expand authority. Use an independent reviewer for interaction and recovery assumptions. A usage-limit failure must be recorded as an interrupted assignment, with writer termination confirmed before takeover.

Revalidate each grant, baseline and resource allocation at execution time. Apply the established 90-minute worker budget, 15-minute progress checkpoints and 30-minute coordinator/review threshold; split work into bounded packets rather than extending budgets silently. No separately billed API run is included.

For each step, update this chapter, `README.md`, `howtouse.md`, affected pilot documentation and the canonical board. Record accepted artifact, exact tested revision, obligation results, corrective work, elapsed time where measured and unavailable costs. These are three implementation phases, each decomposed into reviewable tasks, not three unrestricted worker grants.

After these gates, revisit a controlled parallel-worker comparison using available runtime capacity. Record task/model allocation and include review/integration effort; tmux command execution alone does not establish concurrent model performance.
