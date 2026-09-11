# Canonical discussion task board

- Board revision: 10
- Created at: 2026-09-11T13:58:26Z
- Updated at: 2026-09-11T18:03:37Z
- Authority: current human-facing lead session, subject to the location/transfer rules in [the runbook](README.md).
- Scope: architecture discussion; no running workers or implementation experiment.
- Source baseline inspected: `1699df0a171045c13123aa4b5d81cff3e06c3efa`
- Revalidation policy: every claim/resume, new session/day, or material dependency change. No autonomous claims or leases.
- Live heartbeat/progress: not applicable; no active assignment.

The timestamp describes this board revision, not permission to execute its tasks. `draft` is not claimable. `blocked` requires prerequisite resolution. Owners and generations remain empty/zero until an explicit grant.

## Current tasks

| Task | Packet revision | Record version | State | Owner | Generation | Dependencies | Current activity / next action |
|---|---|---|---|---|---|---|---|
| [SETTING-001](tasks/SETTING-001.md) — choose the experiment setting | 2 | 2 | verified | none (human-resolved decision) | 0 | Owner choice received | Commerce publication selected; [decision and review](decisions/SETTING-001-commerce-publication.md). |
| [BUDGET-001](tasks/BUDGET-001.md) — set troubleshooting and review budgets | 1 | 1 | draft | none | 0 | Human cost/latency preferences; setting informs numeric limits | Agree budget units, checkpoint triggers, escalation authority, and review scope. |
| [CONTRACT-001](tasks/CONTRACT-001.md) — draft paired executable-contract specifications | 8 | 10 | draft | none (coordinator-authored proposal) | 0 | Setting/stack accepted; budgets gate execution, independent review pending | [Schemas/manifest](../pilot/contracts/README.md) pass 74 offline payload cases; draft acceptance and actual adapter checks next. |
| [REFACTOR-001](tasks/REFACTOR-001.md) — multi-agent refactoring and project changes | 1 | 1 | blocked | none | 0 | Owner explicitly resumes this later topic | Deferred by owner; do not dispatch or begin discussion now. |

## Unassigned-task metadata

These values apply to the still-unassigned BUDGET-001 and CONTRACT-001 records, except CONTRACT-001 updated_at and last_progress_at are now 2026-09-11T18:03:37Z, artifact_refs include the draft schemas/manifest, HTTP/identity contracts, provider profile, accepted decisions, and module map, and evidence_refs include the [offline check results and command](../pilot/contracts/README.md). No runtime integration or independent-review evidence exists. REFACTOR-001 uses these unassigned defaults with created_at/updated_at 2026-09-11T14:30:14Z, no progress/evidence, and a blocker of explicit owner deferral. Replace with per-task details when a task changes.

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

Next event sequence: 15. State events and received messages share one coordinator-assigned sequence. Git history preserves prior board revisions; event entries preserve the rationale for individual transitions.
