# 18. tmux Execution Adapter

The local pilot now has a second real command transport: TmuxAdapter runs a Node supervisor inside a private tmux server/session. The supervisor reuses LocalAdapter for process-group termination and records state/results atomically in a private temporary directory. This shares a termination engine; it is not an independent implementation of operating-system process isolation.

The public methods remain start, status, result and cancel. A cancelled run yields a termination receipt only after the supervisor checks the process group. Normal completion captures results before stopping remaining group members. The registry contract is unchanged; callers must continue supplying verified termination evidence before reassignment.

Run from pilot/: `npm run test:adapters`. Shared real-execution scenarios cover successful output, nonzero exit, missing executable, literal argument preservation, premature result rejection, and repeated cancellation. The existing local-process tests also exercise descendants and TERM resistance. Tested locally with tmux 3.6; no coding-model process or multi-worker speed comparison is included.

The adapter uses direct argv invocation documented by the [tmux manual](https://man.openbsd.org/tmux.1); job arguments are serialized to a private file, never injected as shell commands. Each adapter uses its own socket label and each job its own session. dispose removes only its owned run directory after confirmed termination; it never kills a user's tmux server.

Limits: the controller's run map is in memory. Abrupt supervisor/server loss cannot prove termination; cancellation fails closed and retains evidence for operator recovery. Escaping a POSIX process group requires stronger isolation. Host restart recovery, adoption by a fresh controller, credentials separation and actual coding-worker concurrency remain subsequent work.
