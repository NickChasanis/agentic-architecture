# Event aggregation — parallel variant (PAR-001/002)

Fresh matched pair for the phase 4 parallel delivery comparison. Same input document as `../../event-trial/CONTRACT.md` (an event is a non-null non-array object with nonempty string `id`, positive safe-integer `version`, boolean `removed`, string `owner`; dense array; every event validated even superseded/removed; invalid input throws TypeError).

Implement only `pilot/evaluation/event-parallel/aggregate.mjs`, exporting synchronous `aggregateActive(events)` and `countRemovals(events)`. No existing solution satisfies this variant; no implementation exists in the frozen baseline. No dependencies, I/O or global mutable state.

`aggregateActive(events)`: for each ID choose the event with greatest version; equal versions choose the FIRST event in input order (variant of EVENT-TRIAL). Exclude winners with removed=true. Return a new plain array of the chosen original object references ordered by each ID's first occurrence in the input. Empty input returns []. Leave input and objects untouched.

`countRemovals(events)`: return a plain object mapping each owner (exact, case-sensitive string) to the number of events with that owner whose `removed` is true, including superseded/removed events. Keys are the literal owner strings. Empty input returns {}. Validate inputs identically. Both functions must support 20,000 events without spreading all events into a function call.

Run `PAR_IMPLEMENTATION="$PWD/pilot/evaluation/event-parallel/aggregate.mjs" node --test pilot/evaluation/event-parallel/oracle.test.mjs` from the assigned worktree. Frozen oracle is coordinator-owned. Do not read any other cohort's checkout or git branch/solution. No changes outside aggregate.mjs. Use absolute edit paths and explicit shell workdir.

Accounting basis: observed end-to-end wall clock from grant to accepted committed result, failures and reviewer interventions. Requested model recorded separately from runtime-confirmed identity. Tokens, active reasoning time, monetary cost and active human minutes remain null when unavailable. No paid API. This small matched pair cannot establish population-wide capability or monetary savings. Coordinator retains failed attempts; no replacement with its own code inside a cohort.