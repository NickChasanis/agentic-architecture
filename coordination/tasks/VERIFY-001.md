# VERIFY-001 — Portable verification pipeline

Packet revision 1. Authority: /root in the originating Agentic-architecture checkout; its coordination/BOARD.md is canonical, not the worktree copy.

Outcome: make the existing eight portable notes contract tests mandatory in both offline and connected verification. Add `test:portable` to pilot/package.json and invoke it in infra/verify-all.mjs before the build. Preserve every existing check and fail-fast behavior. Add a Node built-in regression test that demonstrates the portable command runs and that a failing portable check prevents later commands; use isolated temporary fixtures, not mutations to the real example. No new dependencies, providers, paid API calls, Docker or browser resources.

Read root README.md, coordination/README.md, canonical BOARD.md, authority policy chapter 7, pilot/package.json, pilot/infra/verify-all.mjs and examples/portable-context/README.md. Baseline: `000d58c6a6a98bf8cf29c0e02792cf08c8c231d8`.

Worker /root/verification_worker, generation 1, owns only pilot/package.json, pilot/infra/verify-all.mjs and new pilot/infra/verify-all.test.mjs. Workspace: /home/nchasanis/.config/superpowers/worktrees/agentic-architecture/verification-worker, branch implementation/verification-worker. You are not alone in the repository; preserve others' edits. Never edit the board, docs, frozen notes tests or notes implementation.

Use test-first implementation. Run the new regression test and `npm run test:portable` from pilot/, including at the final commit. Coordinator handles the full pipeline and two-stage review. Budget: 90 active implementation minutes, checkpoint every 15 minutes, review 30 minutes; escalate scope or contract conflicts immediately. Revalidate grant before initial work, resumption and submission. Native messages are the explicit transport for this exercise; no bridge-driven model control is claimed.

Acknowledge generation, revision and scope. Submit committed SHA, changed paths, actual UTC start/end, checks, failures/retries and limitations through native collaboration. Report model identity only if known, usage/cost as unavailable if not exposed. Do not infer affordability from task duration.
