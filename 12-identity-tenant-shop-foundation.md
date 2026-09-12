# 12. Identity, Tenancy and Shop Foundation

[Overview](README.md) · [Canonical board](coordination/BOARD.md) · [Identity decision](coordination/decisions/IDENTITY-001-commerce-pilot.md)

Recorded 2026-09-12T19:05:31Z against `afe857a1335290fcd86f5d79a66bdf411c2b67f6`. Owner requested a roadmap for the coordinator to follow. This is a five-step implementation roadmap, not five completed tasks or a blanket worker grant. It deliberately stops at a working identity/tenant/shop foundation.

**Goal:** replace synthetic foundation assumptions with a reproducible real login/access slice, while making agent assignment/result contracts executable independently.

**Architecture:** retain a modular backend, canonical wire contracts and the manual coordinator-owned board. Identity authenticates principals and evaluates local permissions; Shops supplies trusted shop-to-tenant context. Test-only identity injection remains separate from the runtime surface.

**Stack:** accepted Angular/TypeScript, Node/Fastify, PostgreSQL and Playwright; newly accepted local Keycloak plus backend `openid-client`. Exact runtime versions/configuration are selected and verified in steps 1–3.

## Execution order

| Step | Deliverable | Depends on | Completion gate |
|---|---|---|---|
| 1 | Reviewable, frozen foundation contract and policy decisions | Accepted identity direction | Shared decisions recorded; independent review and accepted baseline before dependent feature work. |
| 2 | Executable coordination-envelope checks | Existing WORK-SUBMISSION draft; accepted semantics before dispatch use | Positive/negative cases distinguish valid shape from actual assignment authority. |
| 3 | Reproducible isolated runtime foundation | Step 1 environment/policy decisions | Pinned toolchain, real database/provider readiness and safe fixture verification. |
| 4 | Real login, sessions and logout | Steps 1 and 3 | Browser login plus replay, expiry, logout and CSRF denial evidence. |
| 5 | Tenant/shop permissions and thin merchant foundation journey | Step 4 plus reviewed Shops interface | Correct discovery/create-shop flow and denied cross-tenant access through real UI/API/database. |

Step 2 can advance while step 1 awaits owner/reviewer input; neither depends on a running provider. Default execution is sequential in this session. No extra models or workers are launched from the table.

## Step 1 — Settle and review the foundation contract

Responsibility: coordinator as architectural planner/steward; owner settles material policy choices; a separately identified reviewer supplies independent review.

Paths: update `contracts/identity-and-access.md`, `11-identity-provider-and-test-profile.md`, `pilot/contracts/operations/http.json` and affected schemas only through reviewed changes. Record choices under `coordination/decisions/`; record review against an exact revision under `contracts/reviews/`.

- [ ] Close READY-01 from the [readiness review](contracts/reviews/2026-09-12-foundation-readiness.md): define login transaction browser binding, lifetime, atomic single-use consumption and concurrent-login behavior; provider timeouts/failures; bounded request/transaction storage policy.
- [ ] Present remaining shared policy choices together: session expiry, owner/staff grants and revocation semantics, same-origin HTTPS topology, and the mutation/error rules consumed by this foundation. Do not silently treat the identity-provider approval as acceptance of these values.
- [ ] Specify trusted shop-context and permission interfaces before identity and Shops are implemented separately; prevent a circular dependency on catalog.
- [ ] Obtain independent review; record findings and dispositions, then an explicit accepted contract revision. If no reviewer is available, retain draft status and continue only independent draft/check work such as step 2.
- [ ] Rerun both existing contract suites after every schema/manifest change. Document changed behavior and affected consumers rather than merely updating expected results.

Exit evidence: accepted scope/version plus independent review artifact and green affected tests. Policy drafting alone does not satisfy this gate. Numeric worker budgets remain separate and must be resolved before any dispatch.

## Step 2 — Make the coordination contract testable

Responsibility: coordinator locally; later a bounded implementation/test worker may own this slice after an explicit grant. It does not modify live board authority.

Planned paths: `pilot/contracts/coordination/work.schema.json`, `pilot/contracts/coordination/check-submission.mjs`, `pilot/contracts/coordination/work.test.mjs`, and `pilot/contracts/coordination/README.md`. Coordinator owns any `pilot/package.json`/lockfile change. These files do not exist yet.

- [ ] Derive grant/submission schemas from `contracts/work-submission.md`, including generation, packet/contracts, source/artifact revisions, owned paths, check records and UTC timestamps; do not duplicate commerce schemas.
- [ ] Write failing cases for valid current submission, stale generation, changed packet/contract, missing evidence, different tested/artifact revision, out-of-scope paths, duplicate ID/same content and duplicate ID/different content.
- [ ] Implement a pure validator against an explicitly supplied canonical-state fixture. Report accepted-for-review, rejected, or needs-revalidation; never mark a task verified or mutate `BOARD.md`.
- [ ] Test yesterday's still-valid task and yesterday's superseded task separately: age alone is not authority and is not sufficient reason for rejection.
- [ ] Document which WORK-01–08 rules the fixture checks cover and what remains manual. A schema-valid digest or passing claimed command is not proof the artifact exists or the check ran.

Exit evidence: deterministic positive/negative results, mapped to WORK obligations, with no automatic claims, fencing, message delivery or runtime-cancellation claims. Rehearsing those mechanisms is later work. Proposed test command to add and verify here: `npm --prefix pilot run test:coordination`; it is **not runnable yet**.

## Step 3 — Establish an isolated, reproducible runtime

Responsibility: coordinator/integration owner. One writer owns dependency installation, shared configuration and fixture lifecycle.

Planned paths: `pilot/infra/compose.yaml`, `pilot/infra/environment-manifest.md`, `pilot/infra/README.md`, `pilot/apps/api/`, `pilot/modules/identity-tenancy/`, module-owned migrations, and `pilot/tests/integration/`. Add root TypeScript/build/import-boundary configuration under `pilot/`; preserve the existing test-only harness.

- [ ] Inspect available container tooling, CPU/RAM, ports and existing workloads using read-only checks. Do not stop other workloads, expose public services or reset existing databases to make room.
- [ ] Verify compatible versions against official sources and pin packages/images, including image digests, in a reproducible manifest. Do not infer production compatibility from the harness lockfile.
- [ ] Configure isolated PostgreSQL and the synthetic Keycloak realm, exact issuer/callback origins, and HTTPS trusted by browser/backend. Generate environment secrets locally into ignored storage; never commit credentials, cookies or tokens.
- [ ] Establish TypeScript build and module-import checks, application migration ownership, database connectivity and verified issuer discovery. Check the fixture revision and actual subject-to-principal mapping rather than assuming startup import updated an existing realm.
- [ ] Document exact startup, readiness, verification and scoped reset procedures only after testing them. Destructive reset requires an explicitly identified disposable target; never reset a shared environment.

Exit evidence: clean dependency installation/build, healthy isolated services, trusted TLS, verified fixtures and an import-boundary negative test. No successful login is claimed yet. Record actual commands in `pilot/infra/README.md`; this roadmap does not invent working Docker or build commands.

## Step 4 — Implement real login and session lifecycle

Responsibility: identity implementation role, initially this coordinator inline. Architectural review owns policy changes; test execution is deterministic.

Planned paths: `pilot/modules/identity-tenancy/` for session/principal repositories and policies; `pilot/apps/api/` for OIDC/HTTP composition; `pilot/tests/integration/identity/` and `pilot/tests/e2e/login.spec.ts` for evidence. Keep protocol-library integration separate from permission logic.

- [ ] Expand the accepted step-1 contract into a file-level test-first plan before coding; name public module interfaces and each migration's owner.
- [ ] Implement ID-01–04 using `openid-client`, persisted bounded login transactions and application sessions. Only verified issuer/subject mapping may establish a local principal; tokens stay server-side.
- [ ] Test successful real-provider login, fixed redirect and session rotation. Test mismatched/expired/replayed transactions, invalid identity responses and unknown/disabled principal; label protocol doubles versus real-provider cases.
- [ ] Test idle/absolute expiry, logout revocation, cookie clearing and missing/wrong CSRF token or origin. Assert persisted state is unchanged on denied mutations.
- [ ] Exercise at least one real HTTPS browser login without injected identity or bypassed cookie/CSRF requirements. Store only sanitized evidence.

Exit evidence: AUTH-01/02/04/05 checks applicable to login/session at the integrated revision. Discovery portions of AUTH-01 wait for step 5; do not mark the entire obligation complete prematurely. This is a controlled pilot, not production login readiness.

## Step 5 — Deliver tenant/shop access through a thin merchant UI

Responsibility: coordinator integrates identity, Shops and the merchant consumer; bounded workers are optional only after contracts, budgets and owned paths are granted.

Planned paths: `pilot/modules/shops/`, permission logic in `pilot/modules/identity-tenancy/`, `pilot/apps/api/`, `pilot/apps/merchant-admin/`, `pilot/tests/integration/access/`, and `pilot/tests/e2e/merchant-foundation.spec.ts`.

- [ ] Implement ID-05/06 discovery and HTTP-01 create-shop with persisted trusted resource context and the accepted owner/staff matrix. Scope queries by the current principal's live membership/grants, not caller-supplied tenant claims.
- [ ] Create a minimal Angular journey: real sign-in, tenant selection, authorized shop list and owner create-shop. Staff without create permission must also be denied by the API, regardless of UI controls.
- [ ] Test owner, shop-limited staff, staff without grants, no-membership principal, disabled principal and anonymous caller across tenants A/B and shops A1/A2/B1.
- [ ] Assert missing/inaccessible equivalence, current revocation semantics, unknown-field rejection and unchanged data after denials. Assert HTTP identity-injection bypasses are unavailable.
- [ ] Run the connected browser/API/database flow, runtime consumer checks and module-import checks on the combined revision. Record exact commands and sanitized evidence alongside remaining obligations.

Exit evidence: working merchant foundation plus applicable AUTH-03/06/08 and discovery evidence; no claim that catalog/publication or public-route AUTH-07 is implemented. Update the next roadmap to cover draft/publish, immutable-product races, public visibility and second-consumer adaptability.

## How I will follow this roadmap

1. On each continuation, read this file and the live board, inspect Git status/baseline and dependency changes, and resume the first unchecked, unblocked step. Refresh on a new date/session; do not trust a worktree's copied board as authority.
2. Keep this canonical checkout for coordinator decisions. Use an isolated implementation worktree when feature coding starts, preserving unrelated edits. tmux identifies sessions, not grants or isolation.
3. Before each code slice, write a detailed file-level plan and failing behavioral tests, then implement and rerun affected checks. Workers retain internal troubleshooting freedom within an agreed budget; no arbitrary two-attempt cap.
4. At every step boundary, record UTC start/end, source/submitted/integrated revisions, commands/results, unrun checks, changed contract/module paths, elapsed time, rework and human interventions. Record actual model usage/cost only when available; otherwise mark it unavailable, not zero.
5. Commit and push verified scoped changes as already requested. Mark a step complete only when its exit evidence exists. A partial result or blocked prerequisite is a checkpoint, not completion.

No paid model API, multi-agent benchmark, public deployment or refactor phase is authorized by this roadmap. If reviewer access, policy approval, environment changes or budget authority is missing, report the exact gate and continue another independent in-scope step when possible.

## Existing regression commands

These commands exist today:

```bash
python3 pilot/contracts/check_contracts.py
npm --prefix pilot run test:contracts
git diff --check
```

Previous verified baseline: 74 offline payload cases and 28 Fastify tests. Re-run to make new pass claims. New coordination, build, database and browser commands are deliverables of their steps, not evidence already obtained.

**Current cursor: foundation complete; catalog roadmap next.** Steps 1–5 have implementation evidence in commit ba07c3f. Catalog draft/publication and second-consumer adaptability remain intentionally outside this five-step foundation.
