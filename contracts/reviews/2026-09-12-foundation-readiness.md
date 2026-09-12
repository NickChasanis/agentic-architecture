# Foundation readiness self-review

Reviewed baseline: `a4dc0d2010d5dfd4fa9a20114596b4ee9efcea2c`, 2026-09-12 UTC.
Reviewer: current coordinator, also author of the draft/harness. **Not independent review; CONTRACT-001 remains draft.**

Scope: commerce/identity/work-submission drafts, acceptance mapping, operation manifest, and Fastify harness. No feature code or provider environment was created during this review.

## Findings and disposition

| ID | Priority | Evidence and concern | Required disposition |
|---|---|---|---|
| READY-01 | Before identity implementation | IDENTITY-ACCESS explicitly leaves login transaction bounds, rate limits and fixture configuration open. The provider profile also leaves exact environment versions/origins unset. Separate workers would otherwise choose shared failure and lifecycle behavior independently. | Steward specifies transaction expiry/consumption, concurrent login handling, provider timeout/error mapping and bounded storage/requests; records exact environment configuration before dispatch. Review these decisions rather than allowing implicit worker defaults. |
| READY-02 | Before contract acceptance | Keycloak/`openid-client`, session policy, grant matrix and wire defaults are proposals. Stack acceptance does not accept them. | Obtain owner confirmation of the identity direction and pilot defaults; record unresolved details explicitly. This self-review cannot supply that confirmation. |
| READY-03 | Before claiming integration | Harness handlers return synthetic projections. Session/CSRF callbacks return synthetic decisions; Location checks establish presence only. There is no resource-access implementation or persistence. | Keep PUB/AUTH scenarios unrun. Require real-session, resource-scoping and database evidence in the foundation/publication slices. Do not promote the harness to a production adapter unchanged. |
| READY-04 | Before multi-agent experiment | WORK-SUBMISSION has useful version/generation/evidence rules but no executable envelope checks or recorded freshness rehearsal. Product harness evidence does not validate agent coordination. | Add a separate draft coordination conformance slice: current/stale generation, changed packet, duplicate ID with different content, missing checks, and artifact/test-revision mismatch. Manual decisions and process fencing need distinct evidence. |
| READY-05 | Before worker dispatch | Independent review and troubleshooting budgets remain absent; all assignment generations remain zero. | Identify reviewer and numeric budget/checkpoint policy; coordinator grants explicit owned paths and baseline only after prerequisites. No automatic worker launch follows from this report. |
| DOC-01 | Corrected in this checkpoint | HTTP/identity/profile next-step sections still told readers to create schemas or run the first adapter check. Contract index also said competing edits were outside scope while the HTTP draft specifies a proposed last-commit policy. | Update current status and clarify proposed competing-edit policy without accepting it. Preserve historical evidence entries. |

No production vulnerability or full implementation correctness verdict is asserted here: there is no production application. Known serializer warnings remain documented in the harness evidence; passing tests do not settle the readiness findings above.

## Dependency-ordered next steps — both tracks

This is a readiness sequence, **not an executable implementation plan or assignment**. Exact file-level plans follow accepted shared decisions.

| Order | Software-delivery track | Agent-coordination track | Exit evidence |
|---|---|---|---|
| 1 | Confirm identity direction and review wire/policy defaults; close READY-01 shared decisions. | Agree budget/checkpoint units and independent reviewer responsibility. | Recorded decisions and reviewed contract revision; no inferred acceptance. |
| 2 | Pin isolated provider/PostgreSQL/HTTPS environment and synthetic persona mapping; check resource availability before startup. | Draft machine-readable grant/submission checks from WORK-SUBMISSION; use synthetic fixtures without claiming real assignments. | Reproducible environment manifest; positive/negative envelope tests. |
| 3 | Implement real login/session and local permission/discovery foundation before catalog mutations. | Rehearse stale-day, duplicate-message and revalidation handling under the manual board owner. | AUTH evidence with real versus injected identity labeled; separately labeled coordination walkthrough. |
| 4 | Implement shop/draft/publication and exercise the real merchant-to-public browser journey. | Dispatch only dependency-ready, non-overlapping work with pinned baselines, budgets and review capacity. | PUB integration evidence at combined revision and verified work submissions. |
| 5 | Add second catalog consumer against the accepted API. | Exercise a second worker adapter only after its capabilities and cancellation semantics are specified. | Compatibility and changed-module inventory; cost, elapsed time, rework and intervention records. |

Planning/steward work belongs with the architectural role; bounded implementation and test authoring can use cheaper workers once budgets and contracts exist. Deterministic tools execute checks. A verifier cannot waive missing real-system evidence, and the coordinator cannot label their own review independent. No model price or affordability result is inferred here.

## Evidence and limitations

Commands re-run during this review:

```bash
npm --prefix pilot run test:contracts
python3 pilot/contracts/check_contracts.py
```

Results: 28 Fastify tests and 74 offline payload cases pass. The Fastify count includes a table-driven check across 13 operation mappings; it does not mean all PUB/AUTH scenarios passed. No paid execution, worker dispatch, real login, database, browser, or WORK runtime scenario ran.

Next owner decision: confirm or replace the proposed **local Keycloak + backend `openid-client` identity direction**. Confirmation of that direction alone must not silently accept budgets, exact configuration, all remaining policy defaults, or final schema freeze.
