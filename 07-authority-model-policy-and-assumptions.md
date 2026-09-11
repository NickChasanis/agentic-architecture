# 7. Authority, model allocation, and assumptions

[Overview](README.md) · [Roadmap](04-roadmap-of-thought.md) · [Contracts](05-contracts-and-adaptability.md) · [Roles and metrics](06-tmux-agent-roles-and-metrics.md)

This document records decisions accepted in the discussion following document 6. Proposed operating details and empirical hypotheses are labeled separately. No experiment has run, and no model-specific cost or capability comparison is established here.

## Accepted: authority belongs to roles

| Role | Delegated authority | Escalation boundary |
|---|---|---|
| Human owner | Goals, priorities, acceptable tradeoffs, requirement changes, breaking contract changes, and external releases. | May explicitly delegate a bounded action. |
| Coordinator / integrator | Decomposition, assignments, dependency order, integration, and backward-compatible contract extensions supported by compatibility evidence. | Breaking changes, ambiguous requirements, changes to accepted obligations, or consequential tradeoffs outside the agreed budget. |
| Contract steward | Assess whether a proposal preserves accepted consumer obligations; maintain contracts and consumer impact records. | Changes to the obligations themselves. Coordinator can fill this role initially. |
| Implementer | Internal design within the assigned scope and accepted contracts. | New dependencies, shared-file changes outside ownership, or contract changes. |
| Verifier | Determine whether evidence meets agreed criteria; report missing checks and failures. | Missing or contradictory criteria; cannot waive requirements to accept an artifact. |

Backward compatibility must cover the supported consumers and behavioral obligations, not only field names and schema validity. An additive field can still require investigation if consumers reject unknown fields. If evidence is insufficient, compatibility is unresolved and the coordinator cannot label it demonstrated.

Authority is independent of model price. Replacing a model does not expand its permissions or change the assignment's acceptance criteria. Repository visibility is intentionally public, as confirmed by the owner.

## Accepted: initial model allocation policy

| Responsibility | Initial allocation | Expected output |
|---|---|---|
| Architecture and shared-contract design | Flagship model | Boundaries, rationale, compatibility obligations, and unresolved assumptions. |
| Planning and decomposition | Flagship model | Dependency-aware tasks with ownership, focused context, acceptance checks, and escalation conditions. |
| Bounded implementation | Lower-cost model | Reviewable code and evidence against the assigned contracts. |
| Test implementation and failure triage within a clear scope | Lower-cost model | Executable agreed scenarios and reproducible failure evidence. |
| Test execution | Deterministic tools, supervised as needed | Check results associated with the actual revision and environment. |
| Cross-component review and difficult escalation | Flagship model at checkpoints | Findings about composition, assumptions, and unresolved cross-boundary failures. |

These are starting allocations, not permanent model assignments or proof that any particular model is adequate. Specific providers, models, context limits, prices, and runtime capabilities remain to be selected and verified when needed.

Planning includes the verification strategy: success and failure scenarios, supported-consumer obligations, extension exercises, and evidence boundaries. Lower-cost agents can implement those tests, but authoring code and matching tests from the same unreviewed assumption does not establish correctness. Use requirements and independent review to challenge that assumption.

Flagship planning is a versioned baseline. Workers surface contradictions discovered during implementation; the coordinator assesses impact, updates affected assignments, and invalidates stale checks. Re-plan only the affected scope unless the discovery undermines the wider architecture.

## Hypotheses to validate

| Hypothesis | Evidence that would support it | Evidence that would make us revise it |
|---|---|---|
| Upfront reasoning reduces implementation overhead. | Less rediscovery and contract rework, including planning cost in the total. | Extensive speculative planning or repeated redesign consumes the savings. |
| Lower-cost workers are adequate for bounded tasks. | Mandatory obligations pass with acceptable review, retry, and intervention effort. | Frequent escalation, hidden defects, or repeated misinterpretation of clear requirements. |
| Focused context is enough. | Workers identify relevant dependencies and retrieve missing evidence before editing. | Undocumented assumptions or context omissions repeatedly cause incompatible work. |
| Independent checks constrain mistakes. | Consumer checks and integrated scenarios catch errors before acceptance. | Shared blind spots in code and tests allow violated requirements through. |
| Parallelism adds value after planning. | Comparable work reaches integrated verification sooner within the agreed cost budget. | Review queues, conflicts, or duplicated effort erase the improvement. |

Evaluate model allocation and concurrency separately before combining them. An initial comparison can keep the execution sequence and acceptance criteria fixed while changing implementation-model tier; a later comparison can vary concurrency. Record task differences and prior exposure so repeated-task familiarity does not masquerade as a model advantage.

Total monetary cost per accepted outcome includes preparation, implementation, verification, retries, escalation, and integration. Record elapsed time and active human effort separately. Subscription charges and measured API usage may have different accounting rules; choose the basis explicitly and mark unavailable measurements. Failed attempts remain part of experiment cost.

## Proposed next decision: when a task is ready for a lower-cost worker

Require a task packet to answer:

1. **Outcome:** what observable behavior changes, and what is out of scope?
2. **Boundary:** which contracts are provided/consumed, at which versions, and who owns changes?
3. **Workspace:** which baseline, paths, dependencies, and test resources belong to this assignment?
4. **Context:** where are the relevant rules, existing patterns, callers, and source evidence?
5. **Verification:** which obligation IDs and success/failure cases must be checked, using which actual commands and environment?
6. **Budget and escalation:** what time/cost limits apply, and which discoveries require coordination?
7. **Handoff:** which artifact, revision, check results, and unresolved issues must be returned?

Separate three kinds of uncertainty. An unknown accepted behavior or shared boundary prevents dependent implementation; resolve it through design or bounded discovery first. Local implementation choices can remain open for the worker. Environment availability must be checked before assigning work whose verification depends on it.

A proposed readiness response is a short interpretation of the outcome, relevant contract obligations, and intended checks. It is a way to detect misunderstanding, not evidence that the model is correct. The coordinator should compare it with the packet rather than rely on self-reported confidence.

## Proposed escalation and budget policy

Before requesting stronger reasoning, determine whether the obstacle is missing context, unavailable infrastructure, an unclear requirement, an oversized task, or a reasoning failure. Preserve artifacts and provide a focused escalation packet with the attempted approach, new evidence, failing check, and specific decision needed.

Do not retry without a changed hypothesis or new evidence. A retry cap, task budget, and flagship-escalation budget must be agreed before execution; numeric defaults have not been accepted yet. The coordinator can resequence work and escalate within that budget. Exceeding the agreed budget or changing the acceptance tradeoff goes to the human owner.

## Remaining discussion before the experiment

- Accept or revise the task-readiness gate above, especially which architectural uncertainty must be resolved before delegation.
- Choose cost versus latency priorities, retry limits, and escalation budgets.
- Define the amount and timing of independent review for the selected task's risk.
- Select a real setting, representative task, extension exercise, and models; then create executable contracts and a paired experiment plan.

The immediate discussion is about the boundary between sufficient planning and worker autonomy. It does not require selecting a vendor or launching agents yet.
