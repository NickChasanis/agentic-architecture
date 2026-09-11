# REFACTOR-001 — Later discussion: multi-agent refactoring and project changes

Packet revision: 1. Current status and assignment authority: [BOARD.md](../BOARD.md).

## Purpose and timing

Preserve the owner's topic for later: coordinating agents on both small patches and changes affecting the entire project. Do not begin this discussion or dispatch implementation until the owner resumes it. The initial immutable-publication experiment remains the current focus.

## Questions reserved for that discussion

- How should agents discover the full affected dependency graph and divide shared-file ownership?
- Which changes preserve behavior, and which require approved contract evolution or data migration?
- How should a project-wide patch be divided into reviewable, compatible increments?
- How do agents working from different baselines receive updates and invalidate stale evidence?
- What regression, consumer-compatibility, rollout/recovery, and independent-review gates apply?
- How should flagship planning and lower-cost implementation divide this work, and when should they regroup?

Possible future examples include a small internal cleanup, a shared interface/storage refactor, and an explicitly approved feature change. Published-product editing is only a possible contract-evolution example, not a committed feature.

## Proposed discussion outputs

A change classification, decomposition/ownership protocol, integration and recovery strategy, and measurements of affected modules, preserved obligations, rework, review effort, and total cost. Detailed acceptance criteria and budgets are intentionally deferred until the topic resumes.

No workspace, owner, execution baseline, or budget is assigned. The packet is a reminder, not a ready task.
