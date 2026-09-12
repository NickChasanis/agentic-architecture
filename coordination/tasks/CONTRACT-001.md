# CONTRACT-001 — Specify the paired contracts

Packet revision: 11. Current status and assignment authority: [BOARD.md](../BOARD.md).

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

Schema development: [machine-readable artifacts and evidence](../../pilot/contracts/README.md) provide 27 draft definitions, 13 HTTP operations, and 74 passing offline payload cases. The coordinator authored and checked these; no independent review or runtime verification occurred. Draft acceptance, actual adapter conformance, budgets, and dispatch remain open.

Adapter checkpoint, 2026-09-12: [Fastify conformance evidence](../../pilot/contracts/fastify/README.md) adds 28 passing tests, including synthetic success responses across all 13 mappings, strict validation/projection, error handling, and injected session/CSRF gate ordering. This supersedes the earlier pending-adapter note only. No real identity, domain, database, browser, or worker runtime has been verified. Draft acceptance and independent review remain open; generation stays zero.

Readiness checkpoint, 2026-09-12: [coordinator self-review](../../contracts/reviews/2026-09-12-foundation-readiness.md) records READY-01–05, corrected documentation drift, and a dependency-ordered readiness sequence for both tracks. It is not independent review or an implementation assignment. Next owner decision is identity direction; policy details, budgets and final acceptance remain separate gates.

Roadmap checkpoint, 2026-09-12: owner explicitly accepted [Keycloak/backend `openid-client`](../decisions/IDENTITY-001-commerce-pilot.md). Follow [the next five implementation steps](../../12-next-five-implementation-steps.md), beginning with remaining foundation decisions/review; step 2 coordination checks can advance independently. No worker assignment or full contract acceptance is inferred.
