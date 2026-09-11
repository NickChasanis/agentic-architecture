# 5. Contracts, compatibility, and extensibility

[Overview](README.md) · [Dual-track roadmap](04-roadmap-of-thought.md) · [Agent coordination](02-agents-and-coordination.md)

Direction agreed in discussion on 2026-09-11: assess agent-produced software and the coordination system through explicit contracts, demonstrated composition, and measured extension exercises. The mechanisms below are proposed design rules; no executable suite or application has been built in this notes folder.

## What a contract means here

A contract specifies observable obligations at a boundary: what a consumer can request or supply, what the provider guarantees, and what happens under failure or change. A matching data shape alone does not establish compatible behavior.

For every boundary used by the selected journey, record:

- Identifier, version, owner, providers, and known consumers.
- Inputs, outputs, meaning of fields, preconditions, and postconditions.
- Authorization, isolation, validation, and public/private data obligations.
- Errors, side effects, retries, idempotency, ordering, and visibility timing where relevant.
- Supported versions, compatibility policy, extension points, and migration/deprecation expectations.
- Named executable obligations, fixtures, required environments, and evidence at the tested revision.

Keep exact schemas canonical. Link behavioral requirements and checks to those schemas instead of copying signatures into task notes. Mark non-applicable fields explicitly; do not invent distributed-system requirements for a local function.

## Playwright as a useful analogy

Playwright recommends testing user-visible behavior and using user-facing attributes or explicit locator contracts instead of depending on DOM structure. This supports tests that survive internal implementation changes. See its [official best practices](https://playwright.dev/docs/best-practices).

Apply that principle at every boundary: test the promise available to the consumer while allowing internal implementation to change. Playwright is useful for the browser-facing layer; browser success alone does not establish API compatibility, event semantics, or extensibility.

Playwright also supports [mocking API responses](https://playwright.dev/docs/mock). A browser test using a mocked product API establishes behavior against that fixture. Our integrated gate must additionally use the real first-party provider, persistence, and relevant routing/cache paths. External services may use controlled sandboxes or doubles, with the evidence scope stated.

## Contract layers across both tracks

| Boundary | Example obligation | Required evidence |
|---|---|---|
| User journey | Publishing makes the product visible on the correct storefront; drafts and other shops' data stay hidden. | Browser scenario through the integrated first-party application, including denied/error cases. |
| Module or API | Public catalog responses preserve published-only projection, shop scope, errors, and agreed visibility semantics. | Real provider checked against canonical obligations and each supported consumer's expectations. |
| Event/job, when used | A repeated publication event does not duplicate the declared effect; scope and agreed ordering rules survive processing. | Integration scenarios for duplicate, delayed, failed, and reordered delivery as applicable. |
| Agent assignment/result | A result identifies its task, assignment generation, source revision, contract versions, artifact, and check evidence. | Coordinator rejects missing, mismatched, stale, or superseded submissions; valid submissions become reviewable. |
| Worker adapter | A replacement adapter supports declared start, status, cancellation, result, and failure semantics. | Shared adapter conformance suite, capability negotiation, and at least one representative real execution per claimed adapter. |
| Coordinator lifecycle | A changed dependency invalidates affected readiness/evidence; reassignment cannot leave two authorized writers. | State-transition and recovery scenarios, including late completion from the old assignment. |

Contract tests establish the obligations they exercise. Integrated scenarios establish composition for the tested flow and environment. Neither proves every possible interaction; keep the boundary inventory and supported-consumer list explicit.

## How independent agents remain compatible

Agents need a shared protocol even when they never exchange messages directly.

1. The contract owner and affected consumer owners agree the minimum boundary and behavioral examples before dependent work starts. A coordinator may fill those roles in a small team.
2. Each task declares contracts provided and consumed, pinned versions, owned paths, and acceptance-obligation IDs.
3. Workers implement thin increments against those obligations. Consumer fixtures must be checked against the contract and later against the real provider; agreeing with the same inaccurate mock is insufficient.
4. A proposed contract change names affected consumers and compatibility impact. The owner updates the canonical contract, notifies affected assignments, and blocks or rebaselines them before integration.
5. Provider checks, supported-consumer checks, and combined-system scenarios run on identified artifacts/revisions. Record a compatibility matrix for supported combinations; do not require every historical combination.
6. The coordinator accepts completion only with passing required evidence at the integrated revision. Failed, skipped, or unavailable required checks keep the task unverified.

A worker must not weaken the agreed checks to make its implementation pass. Legitimate changes to obligations require the contract owner's review and a recorded rationale. Check authors should derive expectations from requirements and consumer needs, not solely from the implementation under test.

Use the smallest connected increment to expose a boundary mismatch early. Two large locally passing patches are not an integration milestone.

## Measure extensibility through a specified change

“Adaptable” needs a concrete future change. Pick the exercise and allowed change surface before implementation; otherwise we can redefine success around whatever was easy to build.

**Track A candidate:** add a second catalog consumer through the existing public catalog contract. Existing storefront obligations must still pass, and the provider's internal storage representation must remain inaccessible to the new consumer. Record whether provider changes or a new contract version were needed. A second exercise can replace storage behind a repository interface if that boundary exists for a justified reason.

**Track B candidate:** replace one worker adapter with another supported implementation. Keep the coordinator task/result protocol unchanged. Verify capability differences explicitly; reject unsupported capabilities rather than claiming interchangeable behavior. Shared conformance checks and a representative task must pass, including cancellation/failure handling.

These exercises provide evidence for those extension paths, not universal future-proofing. New business semantics may legitimately require a contract evolution and consumer migration.

## Measurement and acceptance

| Measure | Definition | Interpretation |
|---|---|---|
| Required obligation coverage | Required obligation IDs with executable checks / all required obligation IDs in the selected scope. | Exposes missing checks; links matter more than test count. |
| Contract conformance | Passing required obligations / all required obligations, at a named revision and environment. | Required failed, skipped, or unrun obligations prevent acceptance. Coverage alone is insufficient. |
| Consumer compatibility | Passing supported provider/consumer version combinations / declared supported combinations. | Unsupported combinations are explicit; critical failures cannot be averaged away. |
| Integrated journey completion | Required real-flow scenarios passing / all required real-flow scenarios. | Separate results using doubles from results using real first-party integrations. |
| Extension change surface | Existing modules and consumers modified outside the declared extension boundary; breaking contract changes required. | Record reasons and compare with the pre-agreed budget; lines of code are supplementary. |
| Extension effort | Elapsed and active human time from extension request to integrated verification, plus available tool cost. | Measures the practical cost of adaptation. |
| Integration rework | Time spent correcting boundary mismatches after initial submission. | Reveals locally successful work that failed to compose. |
| Coordination conformance | Required assignment, baseline, ownership, stale-result, and recovery scenarios passing / required scenarios. | Measures orchestration behavior independently of generated-code quality. |

Choose risk-appropriate obligations and budgets for the experiment. Acceptance requires every mandatory obligation and supported combination in scope to pass; optional checks are reported separately. Record flaky failures and retries rather than presenting a retry-only pass as clean evidence. Do not use code volume, agent count, or aggregate pass percentages as substitutes for these gates.

## First paired contract workshop

Draft two small contracts together:

- **Publication contract:** an authorized merchant publishes a draft; the correct public consumer observes it under the agreed visibility rule; unauthorized actors and other shops cannot access it.
- **Work-submission contract:** a worker submits an artifact against a specified assignment and contract baseline; the coordinator verifies provenance and required checks, rejects stale results, and records review/integration state.

For each, write a happy path, a denied/invalid path, a stale/repeated action, and an extension scenario. Then decide whether the commerce example or a real repository provides the best first experiment. This is the next discussion output; concrete schemas and runnable tests follow selection of the setting.
