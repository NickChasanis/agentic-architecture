# Portable context example: internal notes index

This example changes the domain from commerce to an internal notes index. Copy its context structure into a new repository, then fill actual revisions, paths, commands and authority in a project-specific assignment. No existing task grant transfers with these files.

The independent repository fixture in `pilot/contracts/coordination/git-worker.test.mjs` demonstrates the Git/grant boundary without commerce code, a database or this conversation: initialize a repository, commit a baseline, create a worker worktree, run a bounded command, commit the output and inspect it for review. It is a deterministic process exercise. A real model implementing the notes requirements below remains an adoption experiment.

## Requirements for the next real worker trial

Inputs are an array of records with nonempty string `id`, string `title`, boolean `archived`, and an array of string `tags`. Duplicate IDs and malformed records must throw. Inputs must never be mutated.

Task NOTES-FILTER: create `src/filter.mjs`, export `filterNotes(notes, query)`. Match title substrings case-insensitively; omit archived records; preserve input order. Empty query returns all active records. Reject non-string queries.

Task NOTES-TAGS: create `src/tags.mjs`, export `countTags(notes)`. Count each exact tag once per active note, omit archived notes, and return a plain array of `{tag,count}` sorted by tag using code-point order. Empty tags are allowed strings; case is significant. Reject malformed inputs.

The tasks own separate files. Shared validation is deliberately specified independently for this small comparison; changing the shared contract requires coordinator review. Freeze evaluator tests before either cohort and supply identical context. Run both tasks sequentially in one cohort and in distinct worktrees concurrently in another. Do not share solutions between cohorts.
