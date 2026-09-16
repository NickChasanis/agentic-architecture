# Event consumer trial — contract 1

Fresh paired sequential delivery exercise. Implement only `pilot/evaluation/event-trial/solution.mjs`, exporting synchronous `latestActive(events)` and `summarizeOwners(events)`. No implementation exists in the frozen baseline. No dependencies, I/O or global mutable state.

An event is a non-null non-array object with nonempty string `id`, positive safe-integer `version`, boolean `removed`, and string `owner` (empty allowed). Additional fields are allowed. Input must be a dense array of valid events; validate every event, even superseded/removed ones. Invalid input throws TypeError. Repeated IDs are expected.

For each ID choose the event with greatest version; equal versions choose the last event in input order. `latestActive` returns the chosen original object references, excluding winners with removed=true, ordered by each ID's first occurrence in the input (not winner position). A removal may be superseded by a newer active event. Return a new plain array, leave input and objects untouched. Empty input returns [].

`summarizeOwners` returns a new plain array of `{owner,count}` counting one per surviving ID according to the same reduction. Owner strings are exact and case-sensitive. Sort owners lexicographically by Unicode code point, including supplementary characters; count must not depend on number of historical events. Empty input returns []. Validate inputs identically. Both functions must support 20,000 events without spreading all events into a function call.

Run `COHORT_IMPLEMENTATION="$PWD/pilot/evaluation/event-trial/solution.mjs" node --test pilot/evaluation/event-trial/oracle.mjs` from the assigned worktree. Frozen oracle is coordinator-owned. Do not read any other cohort's checkout or git branch/solution. No changes outside solution.mjs. Use absolute edit paths and explicit shell workdir.

Accounting basis: observed end-to-end wall clock from grant to accepted committed result, failures and reviewer interventions. Model requested by dispatch is recorded separately from any runtime-confirmed identity. Tokens, active reasoning time, monetary cost and active human minutes remain null when unavailable. No paid API. This small shared-task exercise controls evaluator/context but cannot establish population-wide capability or monetary savings. Coordinator retains failed attempts; no replacement with its own code inside a cohort.
