# Operational comparison protocol

Status: protocol prepared, controlled cohorts not executed. Native launches on 2026-09-14 hit thread and usage limits; the later VERIFY-001 worker ran but required coordinator corrections, documented in [the delivery observation](verification-worker-observation.md). Available tool configuration permits two active agents including the coordinator, insufficient for two simultaneous subordinate workers.

The notes tasks in [the portable example](../../examples/portable-context/README.md) now have eight executable tests and a coordinator-authored implementation. They are an adoption reference, not an unexposed benchmark. Before either cohort starts, prepare fresh comparable variants, commit the test oracle and task packets, freeze the baseline, and record model/provider identifiers, matched context hashes and independent worktree paths. A worker handoff on verification infrastructure is not a matched model cohort.

Compare sequential and two-worker concurrent execution using the same implementation model first. Evaluate model tier separately on fresh comparable task variants; earlier solution exposure invalidates a naive rerun comparison.

For every task record run ID, cohort, actual model, start/end UTC, baseline/final/tested revisions, context and contract versions, retry count, check failures, review time, integration rework, active human effort and actual usage/cost if supplied by the provider. Missing cost is null, never zero. Preserve failed attempts.

No cohort passes unless all contract checks, boundary checks and integrated verification pass at its final revision. Report accepted outcomes per total measured cost, end-to-end elapsed time including review/integration, and invalidated grants or rejected submissions. Do not derive speedup from deterministic child commands or tmux startup.

Restart gate: real worker capacity and independent evaluator available, executable tests frozen, model accounting basis recorded. No paid API workaround is authorized by this packet.
