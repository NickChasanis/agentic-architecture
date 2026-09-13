# 15. Controlled agent comparison

Status update, 2026-09-13: the owner authorized continuation using the recommendations. Operating limits now apply under BUDGET-001. Recovery readiness and a small sequential model-allocation trial have run; see [results and limitations](17-recovery-and-model-allocation.md). The larger sequential-versus-delegated comparison below remains a proposed subsequent experiment.

The pilot established that the product and coordination contracts can compose. The next experiment tests the economic and operational assumptions without changing the contracts.

## Experiment design

Run at least two comparable bounded changes from the commerce pilot. Use the same repository revision, acceptance obligations, test resources, and reviewer standard in both cohorts:

| Cohort | Architecture/planning | Implementation/testing | Coordination |
|---|---|---|---|
| Sequential baseline | Flagship model | Lower-cost model | One coordinator session |
| Bounded delegation | Flagship model | One or two lower-cost workers | Coordinator plus tmux/registry |

The baseline runs first only to establish a reference; its artifacts must not be silently reused as implementation context for the delegated run. Record task complexity, starting revision, model/provider identifiers, context supplied, retries, failures, human interventions and environment conditions.

## Proposed budget for owner approval

These are a starting proposal, not an authorization to spend:

- 90 active worker minutes per task, with a 15-minute progress checkpoint.
- 30 active coordinator/reviewer minutes per task before escalation.
- No paid API usage until the owner approves the accounting basis and provider limits.
- Troubleshooting may continue while producing new evidence; repeating an unchanged attempt is escalation material.
- Breaking contract changes, missing required infrastructure, or budget extension require human-owner approval.

## Acceptance and measurements

Every cohort must pass the same mandatory product and coordination obligations. Compare:

- first-submission compatibility;
- integrated journey completion;
- extension change surface;
- integration rework;
- elapsed time and active human effort;
- recovery outcome and duplicate-writer incidents;
- measured model/tool cost, or `unavailable`.

Do not combine incompatible tasks, waive failed obligations, or infer general superiority from one run. The result may be adopt, revise or stop, with limitations recorded.

## Execution order

1. Owner accepts or edits the proposed budget.
2. Coordinator freezes the task packets and contract baseline.
3. Verifier records the sequential baseline.
4. Coordinator runs bounded delegation with explicit generations and owned paths.
5. Verifier runs the same integrated and extension checks.
6. Evaluator compares evidence and records the decision.
