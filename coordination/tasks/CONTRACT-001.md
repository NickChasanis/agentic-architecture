# CONTRACT-001 — Specify the paired contracts

Packet revision: 4. Current status and assignment authority: [BOARD.md](../BOARD.md).

## Outcome

Produce reviewable specifications for one product behavior contract and the assignment/result contract that governs its delivery. SETTING-001 determines the setting. Draft behavior can be discussed before BUDGET-001 is resolved; budgets gate worker dispatch, paid execution, and final experiment scheduling, not current-session drafting. Do not infer their missing decisions.

Required context: [contract criteria](../../05-contracts-and-adaptability.md), [shared-state protocol](../../08-shared-task-state-and-communication.md), and the two accepted decision artifacts.

## Acceptance obligations

- CON-01: name contract versions, providers, consumers, and decision owners.
- CON-02: define inputs, observable outcomes, invalid/denied cases, and relevant repeated/stale-action semantics.
- CON-03: specify assignment generation, task version, ownership, and evidence checks, including rejection scenarios for obsolete work.
- CON-04: map each required obligation to a planned executable check and identify unavailable environments without inventing runnable commands.
- CON-05: define the product extension and worker-adapter replacement expectations, supported compatibility combinations, and change-surface budgets.
- CON-06: assign shared-contract ownership and obtain review of the specifications before dependent implementation.

This task produces specifications and a verification plan, not a passing implementation. The coordinator must assign paths, baseline, budget, and current dependencies before dispatch. Handoff includes contract artifacts, scenario mapping, review evidence, and the remaining implementation prerequisites.

Coordinator draft artifacts: [contract index](../../contracts/README.md), [publication](../../contracts/commerce-publication.md), [work submission](../../contracts/work-submission.md), and [scenario/obligation mapping](../../contracts/acceptance-scenarios.md). These are proposals; schema details, operating budgets, and independent review remain open. No worker has been dispatched.

Architecture development: [module dependencies and contract ownership](../../09-module-dependencies-and-ownership.md). The owner accepted the modular-backend direction; detailed edges, role allocations, and assignment gates are documented for review before exact schemas and implementation.

Technology development: [stack and workspace proposal](../../10-stack-and-workspace-proposal.md). Includes source-checked framework capabilities, proposed application paths and schema ownership, and an explicit authentication-proof boundary. Stack, versions, identity mechanism, and execution budgets remain open.
