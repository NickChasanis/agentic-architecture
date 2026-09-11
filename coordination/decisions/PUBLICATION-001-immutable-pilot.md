# PUBLICATION-001 — Immutable publication in the first experiment

- Status: accepted by the owner, recorded 2026-09-11T14:30:14Z.
- Artifact revision: 1.
- Source baseline: `ff362ed614dafbe160875b450f11e18d10af697e`.
- Scope: one lifecycle decision within CONTRACT-001; the complete contract remains draft.

The first commerce experiment keeps published products immutable. Drafts remain editable. Once published, an edit request must leave product content unchanged; the exact error representation remains a schema decision. This accepts the invariant behind PUB-08, not evidence that the scenario has run.

The owner also requested a later discussion of multi-agent refactoring, spanning minimal changes and patches across the entire project. Capture that topic in [REFACTOR-001](../tasks/REFACTOR-001.md) without starting it now.

Terminology for that future discussion: the broad topic covers code changes and project evolution. A behavior-preserving refactor must retain accepted contracts; enabling edits to published product data changes observable behavior and requires explicit contract evolution. The owner has not committed to enabling that capability later.

No implementation, schema acceptance, worker assignment, or refactoring execution is authorized by this decision. Its next effect is to keep the first publication contract immutable while the remaining initial-experiment decisions continue.
