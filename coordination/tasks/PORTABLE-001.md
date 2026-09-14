# PORTABLE-001 — Notes module adoption exercise

Packet revision: 1. Live authority: canonical BOARD.md in the originating checkout, /root coordinator. This is an adoption exercise, not a model-cost comparison.

Grant: worker /root/durable_worker, generation/record/packet 1; baseline `fc02028b3bf4d34f44ff92309fc3a723cf842db0`; assigned worktree `/home/nchasanis/.config/superpowers/worktrees/agentic-architecture/worker-ops`, branch `implementation/worker-ops`. Prior reviewer assignment is closed. Model identity was not supplied by runtime; do not invent it.

Read current README, coordination runbook/board, authority policy, `examples/portable-context/AGENTS.md`, its README requirements and `notes.contract.test.mjs`. Implement synchronous `filterNotes` and `countTags` under those frozen contracts. Code-point sorting must handle supplementary Unicode characters. Both functions validate all records including archived inputs and preserve inputs.

Owned paths ONLY `examples/portable-context/src/filter.mjs` and `examples/portable-context/src/tags.mjs`. Do not edit tests, shared dependencies, docs, board or any other paths. No database/browser/paid-model resources. You are not alone in the repository; preserve others' work. Node builtin-only implementation. Budget 90 active implementation minutes, 15-minute checkpoints, 30-minute coordinator review before escalation.

Required obligations: all eight existing tests at the baseline, representing NOTES-FILTER-01/02, NOTES-TAGS-01/02 and NOTES-INPUT-01/02 for both functions. Command from repository root: `node --test examples/portable-context/notes.contract.test.mjs`. Tests were committed before assignment and currently fail due to missing source modules.

Commit only the two owned source files, rerun at commit, report full revision, actual changed paths, UTC command start/end, outcome and limitations through native collaboration. Coordinator independently verifies actual diff and checks before integration. No automatic GitWorker bridge control of the native agent is claimed; this is a supervised native-message handoff.
