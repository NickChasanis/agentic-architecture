# Canonical discussion task board

- Board revision: 1
- Created at: 2026-09-11T13:58:26Z
- Updated at: 2026-09-11T13:58:26Z
- Authority: current human-facing lead session, subject to the location/transfer rules in [the runbook](README.md).
- Scope: architecture discussion; no running workers or implementation experiment.
- Source baseline inspected: `68e33a45bb47cb444d7288ef7182c30c0a6cb3a4`
- Revalidation policy: every claim/resume, new session/day, or material dependency change. No autonomous claims or leases.
- Live heartbeat/progress: not applicable; no active assignment.

The timestamp describes this board revision, not permission to execute its tasks. `draft` is not claimable. `blocked` requires prerequisite resolution. Owners and generations remain empty/zero until an explicit grant.

## Current tasks

| Task | Packet revision | Record version | State | Owner | Generation | Dependencies | Current activity / next action |
|---|---|---|---|---|---|---|---|
| [SETTING-001](tasks/SETTING-001.md) — choose the experiment setting | 1 | 1 | draft | none | 0 | Human product/setting choice | Discuss whether to use the commerce example or a selected real repository. |
| [BUDGET-001](tasks/BUDGET-001.md) — set troubleshooting and review budgets | 1 | 1 | draft | none | 0 | Human cost/latency preferences; setting informs numeric limits | Agree budget units, checkpoint triggers, escalation authority, and review scope. |
| [CONTRACT-001](tasks/CONTRACT-001.md) — draft paired executable-contract specifications | 1 | 1 | blocked | none | 0 | SETTING-001 and BUDGET-001 accepted outputs | Draft after the setting and operating constraints are settled. |

## Unassigned-task metadata

These values apply explicitly to all three initial task records. Replace with per-task details when a task changes.

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

Next event sequence: 4. State events and received messages share one coordinator-assigned sequence. Git history preserves prior board revisions; event entries preserve the rationale for individual transitions.
