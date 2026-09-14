# Supervised Operational Readiness

[Overview](README.md) · [Usage guide](howtouse.md)

Owner authorized implementation on 2026-09-14. Baseline: `3f13c5b5c70b869cf73b47ce3f2f9c46759915b2`. Canonical authority remains the originating Markdown board maintained by /root.

| Phase | Deliverable and gate | Status |
|---|---|---|
| 1. Verified baseline | Reconcile historical claims, fix integration gaps, reproduce connected and offline checks from a clean worktree | Running |
| 2. Worker execution | Validate current grants, isolated Git worktrees, actual committed artifacts and cancellation; observe a real worker handoff | Pending; native launch rejected by session thread limit |
| 3. Supervised recovery | Rehearse persistent state backup/restore, revisions and termination gating; document explicit authority transfer | Pending |
| 4. Affordability experiment | Freeze comparable tasks, context, models and total accounting before execution; run sequential and parallel cohorts | Blocked on worker capacity; no substitute process benchmark |
| 5. Portable adoption | Independent small project exercises the same context/grant/artifact contracts | Pending |
| 6. Operational preparation | Repeatable CI, readiness checks, backup/restore and resource instructions; explicit staging decision | Pending |

Phases 2 and 4 require actual model execution evidence. The native worker launch was rejected by the service's agent thread limit. One coordinator and one worker also cannot demonstrate two simultaneous subordinate workers. Infrastructure and deterministic contract checks may proceed; no model comparison outcome is inferred from them.

All phases preserve published-product immutability and the deferred refactoring decision. No host reboot, production release, external authority transfer or separate paid API use is included. Phase 3 uses an isolated test database; production adoption requires a named target and operator decision.

## Acceptance record

Record commands, exact source revision, UTC times, results, intervention and limitations here after verification. Prior chapter 20 counts came from the reliability worktree: main retained an extra fixture-dependent browser test, and the coordination schema was added in `3f13c5b`, after the initially cited `966a8e1`. Those earlier counts must not be described as a fresh verification of main.
