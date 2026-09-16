# CONTRACT-001 — Specify the paired contracts

Packet revision: 15. Current status and assignment authority: [BOARD.md](../BOARD.md).

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

Technology development: [stack and workspace plan](../../10-stack-and-workspace-proposal.md). Includes source-checked framework capabilities, application paths and schema ownership, and an explicit authentication-proof boundary. See the acceptance update below; versions, identity mechanism, and execution budgets remain open.

Update: [STACK-001](../decisions/STACK-001-commerce-pilot.md) accepts the stack family/layout. The [HTTP API draft](../../contracts/commerce-http-api.md) defines proposed wire operations, payloads, and errors. Versions, authentication/tenant discovery, schema review, and budgets remain open; no runtime evidence exists.

Identity development: [IDENTITY-ACCESS](../../contracts/identity-and-access.md) proposes the login/session approach, owner/staff permissions, discovery APIs, and AUTH-01–08 scenarios. Review/acceptance, provider/library selection, executable schemas, and budgets remain open. No new identity mechanism has been accepted merely by drafting it.

Provider development: [identity provider/test profile](../../11-identity-provider-and-test-profile.md) proposes Keycloak and `openid-client`, plus schema-freeze and isolated fixture requirements. Provider versions/configuration, acceptance, and runtime proof remain pending.

Schema development: [machine-readable artifacts and evidence](../../pilot/contracts/README.md) provide 31 draft definitions, 15 HTTP operations, and 88 passing offline payload cases. The coordinator authored and checked these, then an independent reviewer counted the same executable totals on baseline `9838d79`; no runtime verification occurred. Draft acceptance, actual adapter conformance, budgets, and dispatch remain open.

Adapter checkpoint, 2026-09-12: [Fastify conformance evidence](../../pilot/contracts/fastify/README.md) adds 28 passing tests, including synthetic success responses across all 13 mappings, strict validation/projection, error handling, and injected session/CSRF gate ordering. This supersedes the earlier pending-adapter note only. No real identity, domain, database, browser, or worker runtime has been verified. Draft acceptance and independent review remain open; generation stays zero.

Readiness checkpoint, 2026-09-12: [coordinator self-review](../../contracts/reviews/2026-09-12-foundation-readiness.md) records READY-01–05, corrected documentation drift, and a dependency-ordered readiness sequence for both tracks. It is not independent review or an implementation assignment. Next owner decision is identity direction; policy details, budgets and final acceptance remain separate gates.

Roadmap checkpoint, 2026-09-12: owner explicitly accepted [Keycloak/backend `openid-client`](../decisions/IDENTITY-001-commerce-pilot.md). The five-step identity/tenant/shop foundation is implemented and verified in [pilot README](../../pilot/README.md) and integrated commit `ba07c3f`. This does not accept the full commerce contract or infer a worker assignment; catalog publication, second-consumer compatibility, and independent final contract acceptance remain open.

Catalog checkpoint, 2026-09-12: the [Catalog Publication Foundation](../../13-catalog-publication-foundation.md) is implemented in the catalog worktree. Connected evidence covers schema boundaries, merchant draft operations, row-locked idempotent publication, immutable published products, public projections, Angular/API wiring, 19 integration tests and 4 Playwright tests. This is local disposable evidence only; the second consumer, independent review/acceptance, multi-agent runtime and production proof remain open.

Pilot completion checkpoint, 2026-09-12: the second public-catalog consumer, executable coordination registry, tmux session harness, local/fake adapter conformance, reassignment recovery and deterministic evaluator are implemented. These exercises prove protocol behavior in a local laboratory; they do not prove autonomous multi-agent throughput, production reliability or model-cost savings.

Independent acceptance checkpoint, 2026-09-16: the draft specifications are **conditionally accepted** per the independent review at [2026-09-16-independent-review.md](../contracts/reviews/2026-09-16-independent-review.md). C1 count corrections (27/13/74 → 31/15/88) and C3 stale-application note were applied to the affected artifacts; the review evidence and consistency record remain authoritative. CON-06 review gate is now closed. Open: operating-budget acceptance, controlled-cost comparative execution, schema-version freeze reconciliation (C2 deferred to freeze), and production deployment gating rules. No paid API invocation has occurred; runtime adapter conformance remains an open gate.

Evaluation checkpoint, 2026-09-12: [pilot evaluation](../../14-pilot-evaluation.md) adopts contract-first boundaries and evidence gates, revises the local registry/tmux components before any autonomous claim, and stops unsupported speed/cost conclusions. Independent contract acceptance and controlled comparative runs remain future gates.
