# 16. Controlled experiment packet

This packet freezes the comparison protocol before execution. It supplements [BUDGET-001](coordination/tasks/BUDGET-001.md) and [the controlled comparison](15-controlled-comparison.md).

## Fixed controls

- Baseline revision: the integrated `main` revision at experiment start.
- Product contract: published catalog remains immutable; public projections expose no merchant fields.
- Required gates: contract tests, coordination tests, TypeScript compile, integration tests, build, Playwright and boundary checks.
- Cohorts: sequential single-coordinator execution versus bounded delegation with one coordinator and at most two workers.
- Model allocation: flagship architecture/planning; lower-cost implementation/testing. Exact provider/model identifiers must be recorded per run.
- Accounting: active human time and elapsed time are separate. Tool cost is recorded when measurable; otherwise `unavailable`.

## Candidate task pair

Use both tasks, or replace them before execution with tasks of equivalent scope and record the change:

1. **Merchant catalog list:** add a merchant-only published/draft list consumer without exposing private fields publicly.
2. **Storefront card refinement:** add a second public-card presentation rule using the unchanged `PublicProduct` contract.

Each task must have a separate worktree, owned paths, contract versions, required obligations and independent review. Do not share implementation patches or hidden context between cohorts.

## Run record

For every cohort/task, record:

```text
run_id; cohort; task_id; starting_revision; final_revision
architecture_model; implementation_model; reviewer
context_artifacts; retries; failures; escalations
started_at_utc; finished_at_utc; elapsed_minutes; active_human_minutes
required_checks; passed_checks; integration_rework_minutes
changed_paths; outside_boundary_paths; breaking_contract_changes
recovery_result; tool_cost_or_unavailable; limitations
```

## Stop conditions

Stop and escalate to the owner for a breaking contract change, missing required environment, duplicate writer, budget extension, or a task that is no longer comparable. A failed check remains failed until corrected and rerun on the integrated revision.

The packet is ready for owner approval of the proposed controls. It does not itself authorize paid model calls or claim a benchmark result.
