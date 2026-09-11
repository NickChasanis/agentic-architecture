# CONTRACT-001 — Specify the paired contracts

Packet revision: 1. Current status and assignment authority: [BOARD.md](../BOARD.md).

## Outcome

Produce reviewable specifications for one product behavior contract and the assignment/result contract that governs its delivery. Use the accepted outputs of SETTING-001 and BUDGET-001; do not infer their missing decisions.

Required context: [contract criteria](../../05-contracts-and-adaptability.md), [shared-state protocol](../../08-shared-task-state-and-communication.md), and the two accepted decision artifacts.

## Acceptance obligations

- CON-01: name contract versions, providers, consumers, and decision owners.
- CON-02: define inputs, observable outcomes, invalid/denied cases, and relevant repeated/stale-action semantics.
- CON-03: specify assignment generation, task version, ownership, and evidence checks, including rejection scenarios for obsolete work.
- CON-04: map each required obligation to a planned executable check and identify unavailable environments without inventing runnable commands.
- CON-05: define the product extension and worker-adapter replacement expectations, supported compatibility combinations, and change-surface budgets.
- CON-06: assign shared-contract ownership and obtain review of the specifications before dependent implementation.

This task produces specifications and a verification plan, not a passing implementation. The coordinator must assign paths, baseline, budget, and current dependencies before dispatch. Handoff includes contract artifacts, scenario mapping, review evidence, and the remaining implementation prerequisites.
