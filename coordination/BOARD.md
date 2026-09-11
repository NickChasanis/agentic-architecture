# Canonical discussion task board

- Board revision: 2
- Created at: 2026-09-11T13:58:26Z
- Updated at: 2026-09-11T14:05:10Z
- Authority: current human-facing lead session, subject to the location/transfer rules in [the runbook](README.md).
- Scope: architecture discussion; no running workers or implementation experiment.
- Source baseline inspected: `d52536707abc583230a4fdcc26b8b34b7ab32724`
- Revalidation policy: every claim/resume, new session/day, or material dependency change. No autonomous claims or leases.
- Live heartbeat/progress: not applicable; no active assignment.

The timestamp describes this board revision, not permission to execute its tasks. `draft` is not claimable. `blocked` requires prerequisite resolution. Owners and generations remain empty/zero until an explicit grant.

## Current tasks

| Task | Packet revision | Record version | State | Owner | Generation | Dependencies | Current activity / next action |
|---|---|---|---|---|---|---|---|
| [SETTING-001](tasks/SETTING-001.md) — choose the experiment setting | 2 | 2 | verified | none (human-resolved decision) | 0 | Owner choice received | Commerce publication selected; [decision and review](decisions/SETTING-001-commerce-publication.md). |
| [BUDGET-001](tasks/BUDGET-001.md) — set troubleshooting and review budgets | 1 | 1 | draft | none | 0 | Human cost/latency preferences; setting informs numeric limits | Agree budget units, checkpoint triggers, escalation authority, and review scope. |
| [CONTRACT-001](tasks/CONTRACT-001.md) — draft paired executable-contract specifications | 1 | 2 | blocked | none | 0 | SETTING-001 satisfied by decision artifact v1; BUDGET-001 pending | Commerce setting settled; budget dependency remains unresolved. |

## Unassigned-task metadata

These values apply to the still-unassigned BUDGET-001 and CONTRACT-001 records, except CONTRACT-001 updated_at is now 2026-09-11T14:05:10Z for its dependency refresh. Replace with per-task details when a task changes.

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

Next event sequence: 6. State events and received messages share one coordinator-assigned sequence. Git history preserves prior board revisions; event entries preserve the rationale for individual transitions.
