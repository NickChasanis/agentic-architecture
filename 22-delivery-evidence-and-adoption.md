# Delivery Evidence and Supervised Adoption

[Overview](README.md) · [Usage guide](howtouse.md) · [Operational foundation](21-supervised-operational-readiness.md)

This continuation separates implementation readiness from evidence about real model delivery. The commerce pilot remains local and published products remain immutable. Multi-agent refactoring remains deferred. The canonical board, not this roadmap, grants work.

## Dependency-ordered phases

| Phase | Implementation steps | Exit contract |
|---|---|---|
| 1. Verification coverage | Include portable notes contracts in both standard verification modes; prove a failure stops the pipeline; reconcile stale evidence text. | Existing checks retained, eight notes obligations executed, regression test catches omission and fail-through. |
| 2. Real worker delivery | Issue a fresh bounded grant with a clean separate worktree; receive acknowledgment and committed artifact; review scope, behavior and integrated result. | Actual worker receipt and exact revision, coordinator acceptance, no reliance on stale grants or a deterministic command as model evidence. |
| 3. Affordability comparison | Freeze fresh comparable tasks, evaluator, context hashes, model identities and accounting basis; run sequential cohorts; include failures, review and integration effort. | Accepted outcomes and total effort measured; unavailable usage remains null. No monetary ranking without comparable cost data. |
| 4. Parallel delivery comparison | Repeat with matched fresh task variants and a coordinator plus two simultaneous workers; maintain independent ownership and integration order. | End-to-end accepted delivery compared with sequential control. Requires at least three active agent slots; two slots cannot meet this gate. |
| 5. Interruption and recovery | Select an isolated containment target; interrupt a real worker, preserve its artifact, reconcile durable records and prove the old writer stopped before a new generation. | Old generation cannot write or be accepted; new work integrates once. Existing process-group tests and database restore alone do not prove host recovery. |
| 6. Supervised staging adoption | Name target and operator, approve access and backup-retention policy, select canonical authority, rehearse deployment and rollback. | Operator accepts a reproducible staging run and recovery evidence. No production release or unattended authority is implied. |

Phases 1–2 can advance without cloud credentials or separately billed model calls. Phase 3 must not reuse the already solved notes implementation as an uncontaminated benchmark. Phase 4 has a hard runtime-capacity prerequisite. Phase 5 may prepare local checks independently, but rebooting or taking over a host requires an explicitly designated disposable target. Phase 6 requires owner choices; a general continuation does not choose an external deployment target.

On 2026-09-16 the owner archived real-model cost ranking and cross-model measurement away from the backlog (board event 70). Phases 3–4 remain the eventual roadmap but are not active gates until an owner-funded budget and accounting basis authorize them; ADOPT-001 already closed the local-only sequential and parallel cohorts at zero paid spend as delivery observations, not monetary comparisons.

## Current execution boundary

On 2026-09-15, the coordinator revalidated source `000d58c6a6a98bf8cf29c0e02792cf08c8c231d8`, the eight standalone notes tests and hosted run [34825100616](https://github.com/NickChasanis/agentic-architecture/actions/runs/34825100616). That hosted run preceded portable-suite inclusion and is not evidence that CI ran the notes tests.

VERIFY-001 is the fresh phase 1/2 assignment. Its packet confines the worker to verification infrastructure, leaving frozen notes contracts untouched. The native session transports the grant and receipt; it is not managed or cancelled by the Git worker bridge. Consult the [board](coordination/BOARD.md) for current acceptance and tested revisions.

The [delivery observation](pilot/evaluation/verification-worker-observation.md) records real commits and coordinator interventions. This establishes an assisted native handoff, not independent acceptance: initial edits escaped the assigned worktree and the worker's regression evidence needed replacement. Before scaling model comparisons, repeat the delivery gate with a pre-frozen evaluator and explicit edit confinement. Parallel model capacity and an owner-selected recovery/staging target remain unresolved; no rollout beyond the local pilot is authorized.

## Evidence to carry into another project

Phase 1 is integrated: `npm run verify` and `npm run verify:connected` now include `test:portable`; `test:operations` includes six verifier subprocess regressions. Clean offline source `abf0d3a` passed on 2026-09-15 and independent review passed at `83d4bb4`. Main integration is `d215973`; subsequent board/documentation commits do not change executable behavior. Hosted connected verification of this update is pending at publication. Phase 2 produced an assisted handoff with documented failures; its clean-isolation gate and phases 3–6 remain open.

The next comparison input is [EXT-002](coordination/tasks/EXT-002.md), with a deliberately failing fresh evaluator at `examples/portable-context/fresh-task.contract.test.mjs`. Freeze its packet, evaluator and context hash before assigning any model. Since the original notes functions are already exposed, rerunning them would measure familiarity as well as capability; EXT-002 avoids that contamination.

EXT-002 is now integrated as a coordinator-owned composition example after the fresh worker launch hit the service usage limit. Its corrected evaluator passes 4/4 and the full offline pilot verifier passes at `7735f3a`. This improves the contract surface, but it is not evidence that the lower-cost worker completed the task or that the model allocation is economical.

Keep separate records for requirements, assignments, submissions and acceptance. For example, a worker may report “eight tests pass” against its own commit; the coordinator must still check changed paths, current generation, dependency revisions and the integrated command. A passing result from yesterday can be retained as history without authorizing today's work.

Record failed launches as failed attempts, not implementations. Record an unavailable price or token measurement as null, not zero. A successful lower-cost worker on this bounded wiring task establishes one delivery observation, not that the same model can implement arbitrary architecture or that it is cheaper per accepted outcome.
