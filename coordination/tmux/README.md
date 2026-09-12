# tmux execution harness

`pilot-session.sh` creates named coordinator, worker and verifier windows. It is a transport/session convenience only: it does not claim tasks, grant authority, or mark results verified. Every process must use the current task packet and coordination registry.

Example: `coordination/tmux/pilot-session.sh agentic-pilot`
