# Canonical discussion task board

- Board revision: 22
- Created at: 2026-09-11T13:58:26Z
- Updated at: 2026-09-13T19:50:11Z
- Authority: current human-facing lead session, subject to the location/transfer rules in [the runbook](README.md).
- Scope: supervised recovery-readiness exercise authorized by the owner; active grants below supersede historical defaults.
- Source baseline inspected: `2979178` (reviewed recovery and consumer trial integration)
- Revalidation policy: every claim/resume, new session/day, or material dependency change. No autonomous claims or leases.
- Live heartbeat/progress: MC-001 running under the current lead coordinator; historical worker grants remain closed.

The timestamp describes this board revision, not permission to execute its tasks. `draft` is not claimable. `blocked` requires prerequisite resolution. Owners and generations remain empty/zero until an explicit grant.

## Current tasks

| Task | Packet revision | Record version | State | Owner | Generation | Dependencies | Current activity / next action |
|---|---|---|---|---|---|---|---|
| [SETTING-001](tasks/SETTING-001.md) — choose the experiment setting | 2 | 2 | verified | none (human-resolved decision) | 0 | Owner choice received | Commerce publication selected; [decision and review](decisions/SETTING-001-commerce-publication.md). |
| [BUDGET-001](tasks/BUDGET-001.md) — troubleshooting and review budgets | 3 | 2 | verified | human-authorized coordinator | 0 | Owner instructed continuation using recommendations | 90-minute worker, 15-minute checkpoints, 30-minute coordinator/review limits applied; no separately billed API invocation. |
| [CONTRACT-001](tasks/CONTRACT-001.md) — draft paired executable-contract specifications | 14 | 16 | draft | none (coordinator-authored proposal) | 0 | Pilot evidence exists; independent acceptance and controlled cost comparison still pending | Foundation, catalog, second consumer and local coordination/recovery checks implemented in [pilot README](../pilot/README.md). No worker grant. |
| [REFACTOR-001](tasks/REFACTOR-001.md) — multi-agent refactoring and project changes | 1 | 1 | blocked | none | 0 | Owner explicitly resumes this later topic | Deferred by owner; do not dispatch or begin discussion now. |

## Unassigned-task metadata

Historical defaults (superseded by current task rows and events 23–24): these values originally applied to BUDGET-001 and CONTRACT-001 records, except CONTRACT-001 updated_at and last_progress_at are now 2026-09-11T18:03:37Z, artifact_refs include the draft schemas/manifest, HTTP/identity contracts, provider profile, accepted decisions, and module map, and evidence_refs include the [offline check results and command](../pilot/contracts/README.md). No runtime integration or independent-review evidence exists. REFACTOR-001 uses these unassigned defaults with created_at/updated_at 2026-09-11T14:30:14Z, no progress/evidence, and a blocker of explicit owner deferral. Replace with per-task details when a task changes.

```text
created_at: 2026-09-11T13:58:26Z
updated_at: 2026-09-11T13:58:26Z
last_validated_at: null
revalidate_after: before any claim or resume
claimed_at: null
heartbeat_at: null
last_progress_at: null
lease_expires_at: null (manual mode)
workspace: unassigned
runtime_session: unassigned
owned_paths: unassigned
execution_baseline_revision: unassigned
provided_contract_versions: none assigned
consumed_contract_versions: none assigned
troubleshooting_budget_remaining: unset; dispatch prohibited until assigned
artifact_refs: none
evidence_refs: none
superseded_by: null
cancellation_reason: null
```

## Resolved decision metadata: SETTING-001

Created at remains 2026-09-11T13:58:26Z. Updated, last validated, and last progress times are 2026-09-11T14:05:10Z. Artifact/evidence: [accepted decision v1 and SET-01–04 review](decisions/SETTING-001-commerce-publication.md). Validation concerns the decision record only. Source baseline is recorded above; packet revision is 2.

Owner, claimed time, runtime, workspace assignment, and lease are not applicable: the human resolved the choice directly and the coordinator recorded it; no worker assignment or budget was consumed under this board. Generation remains 0. No provided/consumed implementation contracts exist yet. Superseded/cancelled fields remain null. A verified decision is not claimable; reopening it requires an explicit new coordinator event.

## Message receipts

No messages have been submitted or received. Use these columns for future receipts:

| Sequence | Message ID / file | Received at UTC | Task / generation | Disposition | Resolution / reply |
|---|---|---|---|---|---|

## State event history

| Sequence | UTC timestamp | Task | Previous → new state | Reason |
|---|---|---|---|---|
| 1 | 2026-09-11T13:58:26Z | SETTING-001 | absent → draft | Record pending setting decision; no execution grant. |
| 2 | 2026-09-11T13:58:26Z | BUDGET-001 | absent → draft | Record pending operating-budget decision; no execution grant. |
| 3 | 2026-09-11T13:58:26Z | CONTRACT-001 | absent → blocked | Paired contract work depends on accepted setting and budgets. |
| 4 | 2026-09-11T14:05:10Z | SETTING-001 | draft → verified | Human directly resolved the setting; coordinator captured decision v1 and reviewed SET-01–04. This is decision closure, not a worker implementation transition. |
| 5 | 2026-09-11T14:05:10Z | CONTRACT-001 | blocked → blocked | SETTING-001 prerequisite now satisfied; BUDGET-001 still pending. |
| 6 | 2026-09-11T14:11:23Z | CONTRACT-001 | blocked → draft | Coordinator clarified that budget gates execution, not behavioral drafting; added proposed contracts and scenario mapping after owner requested continuation. No worker grant or accepted schema. |
| 7 | 2026-09-11T14:30:14Z | CONTRACT-001 | draft → draft | Owner accepted published-product immutability; full contract remains draft. |
| 8 | 2026-09-11T14:30:14Z | REFACTOR-001 | absent → blocked | Owner reserved multi-agent refactoring, from small patches to project-wide changes, for later discussion. |
| 9 | 2026-09-11T15:09:28Z | CONTRACT-001 | draft → draft | Owner accepted module proposal and modular commerce backend; coordinator added dependency maps, contract stewardship, and proposed assignment gates. No implementation dispatched. |
| 10 | 2026-09-11T16:08:25Z | CONTRACT-001 | draft → draft | Coordinator drafted stack/workspace and foundation proposal with official capability sources; no stack acceptance, installations, or worker grants. |
| 11 | 2026-09-11T16:16:51Z | CONTRACT-001 | draft → draft | Owner accepted stack direction; coordinator added STACK-001 and HTTP API draft. Authentication, schema review, versions, and budgets remain open. |
| 12 | 2026-09-11T16:23:47Z | CONTRACT-001 | draft → draft | Coordinator proposed OIDC-backed sessions, tenant/shop discovery and grants, and AUTH-01–08 scenarios; provider choice and draft acceptance remain open. No identity runtime created. |
| 13 | 2026-09-11T17:55:27Z | CONTRACT-001 | draft → draft | On owner continuation, coordinator proposed concrete provider/client and fixture/test profile. No provider accepted or started; schema-freeze criteria recorded. |
| 14 | 2026-09-11T18:03:37Z | CONTRACT-001 | draft → draft | Added draft wire schemas/13-operation manifest and verified 74 offline payload cases. Contracts remain unaccepted for dispatch; no runtime or independent review. |
| 15 | 2026-09-12T18:56:45Z | CONTRACT-001 | draft → draft | Revalidated current checkout/baseline on owner continuation after date change. Coordinator added a local Fastify laboratory: 28 tests with synthetic handlers/gates, not real identity/domain integration. No worker grant, paid run, independent review, or contract acceptance. |

CONTRACT-001 metadata update for event 15: updated_at, last_validated_at, and last_progress_at are 2026-09-12T18:56:45Z; artifact_refs/evidence_refs now include the [Fastify harness and proof boundaries](../pilot/contracts/fastify/README.md), superseding the earlier no-runtime-evidence statement only for local adapter checks. No real application integration or independent-review evidence exists. Owner/generation/budget fields are unchanged. Revalidate again before any claim/resume.

## Readiness checkpoint

Event 16, 2026-09-12T19:01:54Z, CONTRACT-001 draft → draft: coordinator self-reviewed baseline a4dc0d2, recorded READY-01–05 and corrected stale status text. Re-ran existing checks; no independent review, acceptance, or worker grant occurred. Updated_at, last_validated_at and last_progress_at for this task now equal this timestamp; evidence_refs include the [self-review](../contracts/reviews/2026-09-12-foundation-readiness.md). Assignment and budget fields remain unchanged. Earlier metadata is historical and superseded by this checkpoint.

## Identity decision and implementation roadmap checkpoint

Event 17, 2026-09-12T19:05:31Z, CONTRACT-001 draft → draft: recorded explicit owner acceptance of [IDENTITY-001](decisions/IDENTITY-001-commerce-pilot.md) and requested the [Identity, Tenancy and Shop Foundation](../12-identity-tenant-shop-foundation.md). Identity direction is resolved; full policy/schema acceptance, independent review and budgets remain open. No worker grant or runtime execution occurred. CONTRACT-001 updated_at, last_validated_at and last_progress_at now equal this timestamp; artifact_refs/evidence_refs include the decision and roadmap, superseding earlier current metadata. Generation stays zero.

## Five-step foundation checkpoint

Event 18, 2026-09-12T19:34:00Z, CONTRACT-001 draft → draft: implemented the five roadmap steps in isolated worktree commit 9e0b7c4, integrated as ba07c3f. Evidence: provider fixture verification, TypeScript compile, boundary checks, 22 coordination tests, 28 Fastify tests, 74 offline payload cases, 16 database/API tests, and 3 real Keycloak Playwright tests. Policy review closed prior important findings. Foundation is not the full commerce experiment: catalog, publication, second consumer, independent contract acceptance, multi-agent runtime coordination, and model cost comparison remain open. Docker stack is disposable/local only; no public service or paid model run. Owner/generation/budget fields remain unchanged.

Next event sequence: 27. State events and received messages share one coordinator-assigned sequence. Git history preserves prior board revisions; event entries preserve the rationale for individual transitions.

## Merchant catalog implementation

Event 26, 2026-09-13T19:50:11Z: MC-UI-001 absent → running, generation 1, packet/record revision 1; worker `/root/merchant_ui`, baseline `239bcf244fe79db49c6a51c2a4b3c0116a93ca31`, same merchant-list execution worktree. Required context: root instructions, this canonical board, chapter 19 step 2, wire schemas and HTTP-08. Owned paths: `pilot/apps/merchant-admin/src/main.ts`, `pilot/apps/merchant-admin/src/contracts.ts`, `pilot/tests/e2e/merchant-foundation.spec.ts` only. Provider remains coordinator-owned. 90-minute worker/15-minute checkpoint/30-minute review limits; no dependencies or paid API invocation. Worker may use the disposable pilot's browser tests after coordinator releases the baseline test run; coordinator will not run concurrent browser or mutable database tests. Receipt via native collaboration, not automatic board ingestion. Review of provider found no remaining blocker; initial reviewer request/response-schema confusion was corrected against source and observed tests.

Event 25, 2026-09-13T19:44:35Z: owner instructed nonstop implementation of the three-step [merchant catalog roadmap](../19-merchant-catalog-visibility.md). MC-001 absent → running, record/packet revision 1, generation 1, owner /root. Canonical board remains this originating checkout; execution worktree is `/home/nchasanis/.config/superpowers/worktrees/agentic-architecture/merchant-list`, baseline `8f4640c`. Scope: roadmap files, merchant list contracts/provider/consumer and tests only. Existing publication obligations remain unchanged. Budget: 90 active implementation minutes, 15-minute checkpoints, 30 active review minutes before escalation; no paid API invocation. Revalidate on resume or dependency changes. Disposable test resources use Compose project `agentic-merchant-list`; no other host database is authorized. No worker grant is issued by this entry.

## Catalog/publication roadmap checkpoint

Event 19, 2026-09-12T20:05:00Z, CONTRACT-001 draft → draft: implemented the [Catalog Publication Foundation](../13-catalog-publication-foundation.md) in isolated worktree commit `74377f7`, integrated into `main` as `c522c89`. Evidence includes catalog schema and tenant/shop foreign keys, draft create/read/update, row-locked idempotent publication, immutable published products, privacy-preserving public projections, Angular/API wiring, 19 connected integration tests, 4 real Keycloak Playwright tests, and the complete verification gate. This checkpoint does not claim independent contract acceptance, a second consumer, autonomous multi-agent coordination, production deployment, or model-cost results. Revalidate before the next claim/resume.

Event 20, 2026-09-12T20:30:00Z, CONTRACT-001 draft → draft: completed the second consumer, executable coordination registry, tmux session harness, adapter replacement/recovery exercises and deterministic evaluator in isolated worktree. Evidence: 21 connected integration tests, 4 Playwright tests, 7 registry/evaluation tests, 23 coordination-envelope/execution tests, boundary checks, TypeScript compile and Angular build. Decision recorded in [pilot evaluation](../14-pilot-evaluation.md): adopt contract-first gates, revise before autonomous use, and make no speed/cost claim. Independent acceptance and controlled comparative runs remain open.

Event 21, 2026-09-13T10:00:00Z, BUDGET-001 draft → draft: added [controlled comparison](../15-controlled-comparison.md) and proposed 90 active worker minutes, 15-minute checkpoints, 30 active coordinator/reviewer minutes, and no paid API usage pending owner approval. This is a proposal only; no model run, spending authority or benchmark result exists.

Event 22, 2026-09-13T10:30:00Z, BUDGET-001 draft → draft: froze the [controlled experiment packet](../16-controlled-experiment-packet.md), candidate task pair, fixed acceptance gates, run-record fields and stop conditions. No paid execution or benchmark result is authorized; owner approval remains the next gate.

## Current exercise grants and receipts

| Task | Worker | Generation | State | Evidence |
|---|---|---|---|---|
| [RECOVERY-001](tasks/RECOVERY-001.md) | /root/recovery_worker | 1 | integrated with coordinator corrections | Adapter implementation needed three follow-up requests; coordinator confirmed process/recovery tests. |
| [EXT-DEFAULT](tasks/EXTENSION-GRANTS.md) | /root/trial_default | 1 | reviewed; artifact preserved | 226ed7f; original six checks pass; supplemental large-input failure retained in report. |
| [EXT-LUNA](tasks/EXTENSION-GRANTS.md) | /root/trial_luna | 1 | integrated with coordinator correction | f5d80d4; six checks pass; EXT-07 fixed in integrated 2979178. |

Event 23, 2026-09-13T00:04:11Z: owner authorized continuation using recommendations; coordinator applied operating limits, recorded RECOVERY-001 and launched an actual bounded worker alongside registry/evaluator work. Separate model trials were subsequently granted at baseline `608c291`; receipts arrived through native collaboration. Canonical authority remained this originating checkout.

Event 24, 2026-09-13T00:17:35Z: coordinator independently checked trial outputs, integrated reviewed recovery/consumer changes as `2979178`, and recorded [findings and limits](../17-recovery-and-model-allocation.md). Worktree evidence includes real cancellation before reassignment, 22 registry/adapter/evaluation checks, 7 consumer checks and public-API composition. Earlier claims of complete real adapter replacement or multi-agent comparison are superseded. Earlier events dated 10:00/10:30 were not derived from the observed clock and must not be used for elapsed-time measurements; current event times were read from the environment.
