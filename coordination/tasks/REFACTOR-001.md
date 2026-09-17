# REFACTOR-001 — Refactor-context logic for the project

Packet revision: 3. Current status and assignment authority: [BOARD.md](../BOARD.md).

## Coordinator proposal — scope, questions, and context (pending owner oversight, 2026-09-16)

Status: coordinator-authored proposal for owner oversight. The deliverable is the **refactor-context logic**: the classification, ownership, evidence, and verification rules this project will apply to any future refactor or cross-cutting change. It is a durable context/document artifact — **not a refactor of the pilot** and not an implementation assignment. The pilot is never refactored under this task.

### 1. Proposed delivery goal

Produce the refactor-context logic as project context that answers, for any future refactor: *what must be checked, who owns it, how it is sequenced, and when an agent's evidence is stale*. This is the coordination-system case the prior experiments did not stress — the prior experiments used fresh bounded tasks with a frozen contract and one owning path; a refactor is one change, many callers, many owning files, stale-evidence risk. The refactor-context logic closes that gap in the project's operating rules.

Deliverable form: a documented protocol (classification, ownership, sequencing, evidence, and verification gates) that can be read by a fresh session before any future refactor, consistent with the project's existing context model ([ch 1](../../01-context-and-onboarding.md)). The pilot implementation stays untouched; hypothetical pilot examples may illustrate the rules but are never executed as refactors.

### 2. Questions, sharpened for this repository

#### Q1 — Change classification: which refactors are safe to parallelize?
Proposed answer shape: a three-class taxonomy driven by [module ownership](../../09-module-dependencies-and-ownership.md) and [contract criteria](../../05-contracts-and-adaptability.md):
- **Class A — module-internal**: single owner module, no public interface change (e.g., cleanup inside catalog). Parallelize safely; verify via existing module checks.
- **Class B — shared-file / shared-interface**: touches a contract steward's artifact or a shared migration/CI/config. Single writer required; all affected consumers re-verified; `WORK-05` contract-change gate applies.
- **Class C — project-wide / behavior-affecting**: changes obligations, schemas, or default behavior. Owner approval first; treated as contract evolution, not cleanup.

Open points for you: are three classes enough, or do you want a workflow-vs-data sub-split? Should Class C always be sequential even when independent modules exist?

#### Q2 — How do agents discover the affected dependency graph?
Proposed answer: no runtime global graph tool. Reuse existing evidence:
1. Module ownership map ([ch 9](../../09-module-dependencies-and-ownership.md)) gives the declared call graph.
2. The offline verifier (`pilot/infra/verify-all.mjs`) already checks import boundaries, cycles, and Markdown links.
3. Each assignment packet names owned paths + "do not touch" paths, and the coordinator runs `rg`/link/boundary scans before granting.
Limit: we must add a **caller-inventory step** to Class B/C packets — grep all callers and list them in the packet before edit, mirroring the VERIFY-001 "real subprocess fixtures, not injected callbacks" lesson. Do you agree caller inventory should be a mandatory packet step?

#### Q3 — How do agents on different baselines avoid stale evidence?
Proposed answer: reuse the `source_baseline_revision` + `observed_task_record_version` envelope fields already in [work-submission](../../contracts/work-submission.md). Add one rule: **a refactor submission is rejected unless its caller inventory lists the exact baseline revision it grepped**, and acceptance re-runs the caller scan against the *integrated* revision. This mirrors `WORK-06` (missing/earlier artifact → unverified) and the ADOPT revalidation discipline. Open: should stale caller inventory block submission outright, or be a review finding?

#### Q4 — How should project-wide patches be divided into increments?
Proposed answer: **contract-first increments, not file batches**. Order increments by consumer risk: (1) introduce new interface/alias, (2) migrate one consumer at a time with each increment independently verified, (3) remove old interface last. Each increment is a reviewable unit with its own gate. This is clone/PUB-10-extension logic applied to internal interfaces. Open: minimum increment granularity — one consumer per increment, or one module per increment?

#### Q5 — When do flagship planning and lower-cost implementation divide/regroup?
Proposed answer: flagship (coordinator) owns the contract-steward artifacts and the increment plan; lower-cost workers take one bounded Class A/B increment each, submit with caller inventory + evidence. Regroup point: every 2 increments or 90 budgeted minutes (`BUDGET-001` cadence), coordinator reviews, updates the plan, invalidates stale inventories. This mirrors ADOPT phase 3/4 but with a *coordination checkpoint inside* the task rather than one big freeze. Open: checkpoint cadence and whether a Class C refactor ever splits.

### 3. Proposed protocol outline (the project context to be written)

The refactor-context document would spell out, for any future refactor:
1. **Caller inventory** — mandatory `rg` scan of every public symbol/interface touched, with revision recorded. Sets the "must-check" surface before any edit.
2. **Class + gates** — assign class (A/B/C), owner approval if B/C, consumer list.
3. **Increment plan** — ordered compatible increments; each increment independently verified.
4. **Evidence contract** — submission re-runs the relevant checks at the integrated revision; stale inventory is handled per Q3.
5. **Regression baseline** — full `npm run verify` must pass before dispatch (frozen), matching ADOPT's frozen-oracle discipline.

The written context is usable with or without the pilot. Pilot paths may serve as worked examples in the document, but no example is executed as an actual refactor.

### 4. Proposed measurements (protocol-hygiene only; zero paid API)

The context document should specify what a future refactor records: affected modules, preserved obligations (checks passing before/after), rework events, review effort, and coordination overhead. Those measurements are *named in advance* so a real refactor can report them; nothing is measured now because nothing is refactored. Cost stays null per BUDGET-001; no monetary ranking (archived per owner, event 70).

### 5. Explicit non-goals

- **No refactor of the pilot code or any implementation** — this task produces context, not changes.
- No change to published-product immutability; editing published products remains a separate contract-evolution decision.
- No global runtime dependency-graph tool (vector database or custom service stays deferred per ch 1/ch 4).
- No change to the board/owner authority model.
- No grant, budget, or dispatch arises from accepting this protocol; a future refactor needs a separate assignment.

### 6. Oversight checklist for you

| # | Decision | Options |
|---|---|---|
| O-1 | Accept 3-class taxonomy? | Yes / amend / reject |
| O-2 | Mandatory caller-inventory step for B/C? | Yes / class-based / no |
| O-3 | Stale inventory = block or finding? | Block / finding |
| O-4 | Increment granularity default? | Per-consumer / per-module |
| O-5 | Checkpoint cadence? | Every 2 increments / every 90 min / other |
| O-6 | Approve written protocol for future dispatch? | Yes / revise / hold |

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

The refactor-context document: a change classification, decomposition/ownership protocol, integration and recovery strategy, and the measurement fields a future refactor must report. Detailed acceptance criteria and budgets for any real refactor remain deferred; this task delivers only the context logic, not a refactor.

No workspace, owner, execution baseline, or budget is assigned; nothing is implemented. The packet's purpose is the refactor-context logic.
