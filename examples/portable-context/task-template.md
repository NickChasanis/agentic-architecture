# Notes worker packet template

Status: example only; no assignment.

Before dispatch, the coordinator fills:

- Task: NOTES-FILTER or NOTES-TAGS, with requirements from this directory's README.
- Canonical board and live coordinator: actual path and identity in the new project.
- Worker/model: actual runtime identity and verified model.
- Packet/record/generation: current values from that board.
- Baseline and worktree: actual full commit, branch and absolute worktree path.
- Owned path: the task's single source file; evaluator owns tests.
- Contracts: notes-input-v1 and the selected output contract.
- Obligations: valid/invalid input, archived exclusion, empty input, ordering and immutability; task-specific matching/counting cases.
- Check command: the actual pre-frozen Node test file and environment.
- Budget: 90 active worker minutes, 15-minute checkpoints, 30-minute review before escalation; no separate paid API invocation.
- Submission: commit, changed paths, check command and revision, UTC times, failures/retries and limitations.

The coordinator supplies context identically across cohorts and records any additional retrieval or intervention. Keep failed submissions for analysis.
