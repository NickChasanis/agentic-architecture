# RECOVERY-001 — Confirm process termination before reassignment

Packet revision: 1. Generation: 1. Baseline: 825df92.

Coordinator: /root in the originating checkout. Worker: /root/recovery_worker.
Workspace: /home/nchasanis/.config/superpowers/worktrees/agentic-architecture/comparison.
Owned files: pilot/contracts/coordination/adapter.mjs and adapter.test.mjs only.
Authority: owner's instruction to continue all phases and apply recommendations.
Budget: 90 active worker minutes, progress every 15 minutes, 30 coordinator/reviewer minutes before escalation. No separately billed API invocation. Use the session's available model; record identity, do not infer dollar cost.

Implement start/status/result/cancel for local child processes. Start must handle spawn errors; result must reject premature reads. Cancel must await termination, handle a process that ignores TERM, and confirm its process group stopped before reporting stopped=true. Bound output. Add representative process execution/failure/cancel/descendant tests. Preserve compatible start/status/result calls; cancellation is a stronger explicit receipt contract. A fake adapter must be an independent deterministic test double and cannot count as a second real runtime.

Return test commands/results, changed paths, commit if requested by coordinator, and limitations. Do not change registry, board, or other files. Acknowledge grant before editing; submit results via the collaboration channel. This tests recovery readiness, not relative model performance.
