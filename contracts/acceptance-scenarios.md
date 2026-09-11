# Paired acceptance scenarios — 0.1-draft

These scenarios map draft contract obligations to planned runtime evidence. All PUB/AUTH/WORK runtime scenarios below are **not run**. The stack family is selected, and [offline schema/manifest checks](../pilot/contracts/README.md) pass; there is no application or second adapter yet. Offline payload cases do not count as executed end-to-end scenarios.

## Product scenarios

| ID | Scenario | Planned evidence |
|---|---|---|
| PUB-01 | Authorized merchant creates a shop, drafts a product, publishes it, and shopper sees it. | Browser journey through real first-party UI/API/persistence; record integrated revision. |
| PUB-02 | Draft product is requested through public list/detail. | Real API absence/not-found and browser absence. |
| PUB-03 | Principal changes tenant/shop/product IDs to reach an unauthorized resource. | Provider authorization checks across A1/A2/B1 and unauthenticated cases; no data disclosure. |
| PUB-04 | Invalid draft input or update is submitted. | Agreed validation error and unchanged persisted state. |
| PUB-05 | Publish is repeated or races with another publish of the same product. | One logical published state, stable identity, no duplicate declared effect. |
| PUB-06 | First public read starts after successful publish response. | API ordering evidence proves visibility without polling through an eventual-consistency delay; include caches if introduced. |
| PUB-07 | Public payload is inspected. | Explicit allowlist and value validation; no merchant-only fields. |
| PUB-08 | Published product receives an edit request. | Accepted immutability obligation: reject the edit and preserve content. Exact error schema remains draft; check not run. |
| PUB-09 | Publish response is uncertain due to interrupted transport. | Retry resolves to the same published product; UI does not falsely assert success. |
| PUB-10 | Fresh worker adds the second catalog consumer. | Existing/new consumer checks, real flow, changed-module inventory, clarification/rework/time records. |

Planned provider/consumer matrix: catalog contract 0.1-draft with merchant administration and storefront first; add second catalog listing for PUB-10. Once accepted, assign a stable version and pin exact artifacts. Unsupported versions must be explicit; draft version labels do not authorize implementation.

## Identity foundation scenarios

All scenarios below are proposed and not run. They extend PUB-01/03 rather than replace publication checks. Exact routes and personas are in [IDENTITY-ACCESS](identity-and-access.md).

| ID | Scenario | Planned evidence |
|---|---|---|
| AUTH-01 | Synthetic merchant signs in through the real controlled OIDC provider. | Session rotation, valid callback, fixed redirect, and browser tenant/shop discovery; no injected principal for this gate. |
| AUTH-02 | Invalid/replayed/mismatched login response or external identity. | No application session; generic failure without tokens or account details. |
| AUTH-03 | Owner, shop-limited staff, no-membership principal, and anonymous visitor call discovery/actions. | Exact role matrix, empty discovery, missing/inaccessible equivalence, cross-shop/tenant denial. |
| AUTH-04 | Session expires, is logged out, or principal is disabled. | Subsequent protected requests fail; cookie/server state checked independently. |
| AUTH-05 | Mutation has missing/wrong CSRF token or disallowed origin. | No state change; expected 403 after session authentication. |
| AUTH-06 | Membership/grant is revoked. | New authorization checks deny after committed revocation; in-flight semantics documented. |
| AUTH-07 | Logged-in merchant calls public catalog for drafts or another shop. | Same public projection as anonymous calls; no privileged preview. |
| AUTH-08 | Test identity injection is configured for isolated API checks. | It is inaccessible in the runtime HTTP surface and never reported as real login proof. |

## Coordination scenarios

| ID | Scenario | Planned evidence |
|---|---|---|
| WORK-01 | Worker requests and acknowledges a current assignment. | Grant contains required baseline/versions/scope/budget; only named worker starts. |
| WORK-02 | Two workers request one task or overlapping paths. | Serialized manual decision; no conflicting grants. Later automated adapter requires actual concurrent claim testing. |
| WORK-03 | Worker opens yesterday's completed or superseded packet. | Canonical refresh prevents a new claim. |
| WORK-04 | Yesterday's unfinished task is still valid. | Explicit revalidation allows a current grant/resume; age alone causes no cancellation. |
| WORK-05 | Shared contract changes during implementation. | Affected task blocked/revalidated; old-version evidence cannot silently pass acceptance. |
| WORK-06 | Result is missing checks or references an earlier artifact. | Submission remains unverified; artifact/check mismatch is visible. |
| WORK-07 | Worker returns after reassignment. | Old writer stopped/fenced and old-generation submission rejected; separate process evidence when a runtime exists. |
| WORK-08 | Message is duplicated or arrives late. | Deduplication and version handling; no duplicate/obsolete transition. |
| WORK-09 | Heartbeat continues but investigation makes no progress. | Progress/budget review distinguishes contact from useful investigation. |
| WORK-10 | Registry or notification is unavailable. | Refresh/checkpoint procedure detects unavailable authority and pauses mutations. |
| WORK-11 | Worker runtime adapter is replaced. | Both adapters pass applicable start/status/cancel/result/failure checks and a representative task; changed-module inventory. |

## Review and integration gates

The planning model defines these obligations; implementation workers may add useful checks but cannot remove requirements to obtain a pass. Independent review must examine requirements and real consumers, not only the author's result summary.

Run provider/consumer checks before accepting local artifacts, then rerun affected checks and real journeys on the integrated revision. Record retries, skipped checks, limitations, and defects. A manually reasoned scenario is labeled a walkthrough, not an executed test.

## CONTRACT-001 draft coverage

| Task obligation | Draft coverage | Still required |
|---|---|---|
| CON-01 | Contract IDs, proposed stewardship, providers/consumers. | Accepted schema versions and actual assigned owners. |
| CON-02 | Logical operations, failures, repeated/stale actions, and draft wire schemas. | Review/acceptance of limits and errors; runtime verification. |
| CON-03 | Generation, record version, ownership, and evidence rules. | Executable validation and runtime mechanism selection. |
| CON-04 | PUB/AUTH/WORK mapping and offline schema-check command/results. | Real runtime environments, integration commands, and scenario evidence. |
| CON-05 | Proposed zero-internal-change extension budgets and supported consumers. | Budget acceptance and actual runtime compatibility matrix. |
| CON-06 | Coordinator authors/stewards draft; independent review required. | Independent review and accepted final baseline. |

No completion claim for CONTRACT-001 follows from this draft coverage. Operating budgets still gate execution. The next architectural discussion can review publication lifecycle and module boundaries while those budgets remain open.
