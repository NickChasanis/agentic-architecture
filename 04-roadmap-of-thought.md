# 4. Roadmap of thought and implementation experiments

[Overview](README.md) · [Context onboarding](01-context-and-onboarding.md) · [Agent coordination](02-agents-and-coordination.md) · [Enterprise example](03-enterprise-delivery-example.md)

Status: discussion roadmap, updated 2026-09-11. Agreed direction: pursue both software delivery and coordination-system design as separate, connected tracks; assess compatibility and extensibility through explicit, executable contracts. The detailed milestones below remain proposals, not scheduled implementation commitments.

## Where the discussion stands

The existing notes establish a coherent starting approach: progressive context loading, bounded task ownership, a coordinator responsible for integration, and verification of the combined result. The commerce example shows how that approach could deliver one vertical slice.

The remaining work is to test the assumptions behind that approach and make the operating rules concrete. In particular, we have not selected a real project, established a delivery baseline, defined the limits of agent authority for that project, or demonstrated that parallel work improves its outcomes.

Keep two design subjects distinct throughout the discussion:

- **The product being built:** its users, domain boundaries, behavior, and deployment needs.
- **The system of work building it:** context, delegation, permissions, task state, review, and recovery.

The commerce platform is currently an example of the first subject. Both subjects are in scope for ongoing design and experiments. Selecting a real application and the implementation scope of the coordination system remains open.

## Two connected tracks

| Stage | Track A — delivering adaptable software with agents | Track B — designing the coordination system | Shared checkpoint |
|---|---|---|---|
| Frame | Choose a representative feature and expected future change. | Identify coordinator users, task lifecycle, authority, and required execution capabilities. | Shared vocabulary and observable outcomes for both tracks. |
| Specify | Define provided/consumed interfaces and behavioral obligations. | Define task, artifact, evidence, capability, and state-transition contracts. | Versioned contract inventory with owners and consumers. |
| Decompose | Assign bounded changes and shared dependencies. | Define readiness checks, ownership allocation, and contract-change notification. | No dependent task starts with an unknown contract baseline. |
| Demonstrate | Integrate a thin feature through real components. | Run the task lifecycle through the smallest useful coordination prototype or existing-tool adapter. | Trace a requirement through assignment, artifact, integration, and verification. |
| Change | Add a consumer or replace an implementation behind a declared interface. | Replace a worker adapter and rehearse reassignment or incompatible contract updates. | Existing obligations still pass; adaptation effort and affected consumers are recorded. |
| Evaluate | Assess compatibility, change effort, quality, and delivery time. | Assess recovery, coordination effort, and protocol conformance. | Decide the next bounded increment independently for each track. |

Advance both tracks at each checkpoint. Track A supplies realistic workloads and exposes missing coordination requirements. Track B supplies the protocols and evidence handling used by Track A. A manually exercised protocol can validate early design while an executable prototype develops; record which capabilities are manual, simulated, or implemented.

The shared testing and measurement rules are in [Contracts, compatibility, and extensibility](05-contracts-and-adaptability.md).

## Roadmap of thought

Work through these stages in order initially. Return to an earlier decision when an example exposes a contradiction. Each stage should end with a small, reviewable output and an explicit unresolved-question list.

| Stage | Main question | Discussion exercise and output | Ready to move on when |
|---|---|---|---|
| 1. Purpose and scope | What should each track achieve? | Write an objective and non-goals for delivery and for the coordination system. Choose a shared example and one anticipated extension. | Both tracks have distinct outcomes and a shared compatibility checkpoint. |
| 2. Representative journey | What concrete task will anchor the reasoning? | Use the publish-and-view example or a bounded change in an existing project. Describe the initial state, desired outcome, failure cases, and constraints. | The outcome can be checked independently of an agent's completion report. |
| 3. Context and authority | What must a fresh agent know, and what may it decide? | Walk through onboarding. Identify authoritative requirements, source evidence, permitted actions, escalation ownership, and how contradictions are resolved. Produce a context map and a short authority table. | A new session can find its scope, rules, and evidence; consequential decisions have an owner. |
| 4. Decomposition and coordination | Which work actually benefits from parallel execution? | Draw the task dependencies. Assign write ownership, shared-contract ownership, and integration responsibility. Compare a sequential plan with a bounded-worker plan. | Each proposed worker has an independent outcome, available prerequisites, and a meaningful check. |
| 5. Failure and recovery | What happens when a worker or an assumption fails? | Walk through a lost session, stale context, a changed contract, conflicting edits, and a failed integration check. Record the state transition, retained artifacts, responsible owner, and restart conditions. | We can recover without duplicate writers or treating unfinished work as verified. |
| 6. Evidence and tradeoffs | What proves composition and adaptability? | Define contract obligations, provider/consumer checks, integrated journeys, an extension exercise, timing boundaries, and cost/human-effort tracking. Use the measurement definitions in document 5. | Required obligations pass on the combined revision, and extension cost is observable. |
| 7. Implementation decision | What is the smallest paired experiment worth running? | Select a delivery task and a coordination capability exercised by that task. Record each hypothesis, scope, and evidence. | Both experiments have defined contracts, checks, and a review point. |

## Suggested first discussion

Start with: **What first feature and subsequent extension should both tracks prove they can support?**

Candidate: implement publish-and-view, then add a second catalog consumer without changing the publication provider's internals. Alongside it, specify and prototype assignment, contract-baseline validation, artifact submission, and evidence-based completion. Then replace the worker adapter while preserving that protocol.

The common difficulty to investigate is:

> Independently working agents must produce components that compose through declared contracts, preserve existing consumers, and support a specified extension with bounded changes.

The concrete example and change budget still need to be selected. This does not assume agents must converse directly: coordination can occur through authoritative artifacts and enforced gates.

## Conditional implementation roadmap

Begin implementation after identifying the task, authority boundaries, and contracts. Pair each delivery milestone with the coordination work below; the example remains hypothetical until a test setting is selected.

| Milestone | Concrete work | Evidence required before continuing |
|---|---|---|
| I0. Select the test setting | Choose the actual repository and bounded journey; inspect its instructions, working state, setup, and existing checks. Record the initial revision and task requirements. | A usable environment and an observable acceptance scenario. |
| I1. Establish a sequential baseline | Have one agent complete a representative task. Record onboarding time, implementation time, review, integration, verification, human interventions, and available usage/cost data. | A verified result and a record of where effort went. |
| I2. Test context and restart | Create or adapt the minimum entry point, task packet, and handoff. Give a fresh session a comparable task or resume a deliberately paused task. | The session finds relevant rules and resumes from actual artifacts; missing or misleading context is recorded. |
| I3. Test bounded delegation | On a suitable comparable task, use a coordinator and at most two workers with explicit ownership and prerequisites. Integrate and run the same standard of acceptance checks. | A verified combined result, with coordination, conflicts, rework, and human effort included in the measurement. |
| I4. Rehearse recovery | In an isolated experiment, interrupt a worker or change a shared contract. Exercise stop, handoff, reassignment, and re-verification procedures. | Work is preserved, the previous writer cannot continue after reassignment, and affected results are rechecked. |
| I5. Decide what to keep | Compare the observations and repeat on additional comparable tasks if the evidence is ambiguous. Retain useful documents and procedures; identify any recurring manual step worth automating. | An explicit adopt, revise, or stop decision with supporting evidence and limitations. |

Coordination work proceeds alongside those milestones:

- **I0:** define versioned task/result envelopes, ownership rules, and completion-evidence references.
- **I1:** record the baseline through a minimal task-state and artifact ledger; identify its manual operations.
- **I2:** prototype baseline validation and restart from durable task/artifact records.
- **I3:** enforce dependency readiness and exclusive write assignments; validate submitted results against the assigned contract versions.
- **I4:** invalidate stale evidence after contract changes; stop/reassign workers and reject late results from superseded assignments.
- **I5:** run the product extension and worker-adapter replacement exercises, then assess each track independently.

At I3, completion requires producer/consumer contract checks and real integrated behavior. At I5, unchanged supported-consumer checks must still pass after the extension. Local tests, generated code volume, and worker completion reports cannot substitute for either gate.

One task per approach is exploratory evidence, not a reliable speedup benchmark. Reusing the same task can advantage later runs through familiarity or retained artifacts. Record task differences, model/tool configuration, starting context, cache/environment conditions, and any carryover that affects interpretation. A restart exercise tests recoverability; it does not by itself establish a delivery-speed improvement.

Do not set percentage-improvement targets before seeing the baseline. Agree acceptable quality, cost, and human-effort tradeoffs before judging the experiment. If usage or cost cannot be measured, mark it unavailable rather than estimating it as observed data.

## Questions to defer until evidence makes them relevant

- A vector database or custom memory service: revisit if repository navigation and task notes repeatedly fail to provide needed context.
- Permanent specialized agent teams: revisit if recurring tasks require materially different permissions, tools, or verification methods.
- The breadth of a custom orchestrator: design and prototype the scoped coordination capabilities now; defer a general platform, scheduling infrastructure, and administration UI until their requirements are demonstrated.
- More concurrency: revisit if independent ready work exists and review/integration capacity can absorb it.
- Product microservices: decide from product and operational requirements, separately from agent assignments.

## How to preserve the discussion

For each settled topic, append a short record here or link an existing decision document:

```text
Question:
Status: open / proposed / accepted / superseded
Decision owner:
Options considered:
Decision and rationale:
Evidence or example:
Remaining uncertainty:
What would cause us to revisit it:
Next discussion or experiment:
```

An accepted discussion decision records our chosen direction. Only executed checks and observed results can establish that the direction works in practice.
