#!/usr/bin/env bash
set -euo pipefail
session="${1:-agentic-pilot}"
command -v tmux >/dev/null || { echo "tmux is required" >&2; exit 1; }
if tmux has-session -t "$session" 2>/dev/null; then echo "session already exists: $session"; exit 0; fi
tmux new-session -d -s "$session" -n coordinator
tmux new-window -t "$session" -n worker
tmux new-window -t "$session" -n verifier
tmux select-window -t "$session:coordinator"
echo "created tmux session $session (coordinator, worker, verifier); authority remains coordination/BOARD.md"
