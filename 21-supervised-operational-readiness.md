# Supervised Operational Readiness

[Overview](README.md) · [Usage guide](howtouse.md)

Owner authorized implementation on 2026-09-14. Baseline: `3f13c5b5c70b869cf73b47ce3f2f9c46759915b2`. Canonical authority remains the originating Markdown board maintained by /root.

| Phase | Deliverable and gate | Status |
|---|---|---|
| 1. Verified baseline | Reconcile historical claims, fix integration gaps, reproduce connected and offline checks from a clean worktree | Passed; read-only review found no confirmed blocker |
| 2. Worker execution | Validate current grants, isolated Git worktrees, actual committed artifacts and cancellation; observe a real worker handoff | Bridge implemented and tested; real worker handoff blocked by service thread limit |
| 3. Supervised recovery | Rehearse persistent state backup/restore, revisions and termination gating; document explicit authority transfer | Local backup/restore and termination gates passed; host recovery remains unproven |
| 4. Affordability experiment | Freeze comparable tasks, context, models and total accounting before execution; run sequential and parallel cohorts | Blocked on worker capacity; no substitute process benchmark |
| 5. Portable adoption | Independent small project exercises the same context/grant/artifact contracts | Deterministic notes contract and implementation passed; real-model handoff pending |
| 6. Operational preparation | Repeatable CI, readiness checks, backup/restore and resource instructions; explicit staging decision | Local pipeline and GitHub connected CI passed; staging not ready |

Phases 2 and 4 require actual model execution evidence. The native worker launch was rejected by the service's agent thread limit. One coordinator and one worker also cannot demonstrate two simultaneous subordinate workers. Infrastructure and deterministic contract checks may proceed; no model comparison outcome is inferred from them.

All phases preserve published-product immutability and the deferred refactoring decision. No host reboot, production release, external authority transfer or separate paid API use is included. Phase 3 uses an isolated test database; production adoption requires a named target and operator decision.

## Acceptance record

Verified clean source revision `77bb92a35d4df4ad8c0895bdace29bc9811b1554` in the operational worktree with `npm run verify:connected`, 2026-09-14T08:33:17.447Z to 2026-09-14T08:35:01.788Z. Node 22.21.1, isolated Compose project `agentic-operational`, ports 3543/8543/56432, generated synthetic fixtures. All commands passed and stopped-on-failure behavior was observed during the earlier tmux failure. Prior chapter 20 counts came from the reliability worktree: main retained an extra fixture-dependent browser test, and the coordination schema was added in `3f13c5b`, after the initially cited `966a8e1`. Those earlier counts must not be described as a fresh verification of main.


| Check | Observed result |
|---|---|
| Offline schemas/manifest | 31 definitions, 15 mappings, 88 payload cases |
| Tracked Markdown local links | 62 files, zero broken links |
| Fastify contracts | 30 passed |
| Coordination envelopes | 22 passed |
| Consumer extension | 7 passed |
| Registry/recovery/evaluation | 22 passed |
| Local/tmux adapters | 11 passed |
| Worktree bridge and port isolation | 8 passed |
| Connected integration | 36 passed |
| Durable coordination | 12 passed |
| Backup/restore including separate CLI processes | 1 scenario passed |
| Playwright browser journeys | 16 passed |
| Provider, boundaries, TypeScript, Angular build | Passed; existing Ajv CommonJS warnings remain |

Two corrections were necessary: the old browser filter test failed against an empty product fixture, and tmux could report a completed runner as lost when its session exited between status reads. The latter has a deterministic failing-before/fixed-after regression plus real tmux checks. Initial implementation and review in this slice were coordinator-performed after worker launch failed. A subsequent reused read-only reviewer withdrew its sole pool-ownership finding after checking guarded close(), with no remaining confirmed important finding (board events 34–35). That review is not a worker implementation submission, independent contract acceptance or comparative cost/speed result.

The [operations guide](pilot/OPERATIONS.md) documents verification, backup commands and the staging decision. The [comparison packet](pilot/evaluation/operational-comparison.md) and [portable notes context](examples/portable-context/README.md) are ready for the next planning gate. The portable contract has eight passing checks on coordinator implementation; an actual worker handoff and executable model cohorts remain outstanding. No active worker grant survives this slice.

## Resumption conditions

Revalidate the canonical board, current source and task/model allocation before each dispatch; historical service failures do not establish today's capacity. The notes evaluator is committed and passing, but its implementation is already exposed. Freeze fresh comparable variants before model cohorts. Host-reboot/process-containment proof needs a suitable isolated target; select a staging target and operator responsibilities before external deployment or authority transfer. The current continuation is tracked in [chapter 22](22-delivery-evidence-and-adoption.md).
