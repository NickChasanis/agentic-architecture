# Commerce pilot contract drafts

Status: proposed `0.1-draft` contracts for discussion, created 2026-09-11T14:11:23Z. These are behavioral specifications, not accepted production interfaces, executable schemas, or passing tests.

- [Commerce publication](commerce-publication.md): product behavior and provider/consumer boundaries.
- [Assignment and work submission](work-submission.md): current-task identity, ownership, messages, and result acceptance.
- [Acceptance scenarios](acceptance-scenarios.md): checks to implement and evidence to collect.

The coordinator acts as the proposed steward for both contracts. Affected consumer requirements and independent review must inform acceptance. Implementation agents cannot change these contracts unilaterally. Exact schema files and runnable commands follow stack/environment selection; those are not prerequisites for reviewing the behavior here.

## Concrete proposed defaults

1. Publication changes a draft to published atomically; repeating it returns the same published product without duplicate effects.
2. Only drafts can be edited in the pilot. Editing published products, unpublishing, deletion, pagination, and competing edits are later scope unless deliberately added before acceptance.
3. A successful publish response means a subsequent public read started after that response sees the published version. Reads overlapping publication may observe the previous state.
4. A second consumer is a small read-only catalog listing using the public API. Its internal implementation and UI may differ from the first storefront.
5. Current assignment identity and contract versions control work acceptance. Dates identify activity but do not confer ownership.

These defaults make the draft reviewable without pretending every detail has been agreed. They preserve the accepted initial journey and exclude checkout/payment behavior.

## Dependency clarification

Behavioral drafting can proceed after the setting decision. BUDGET-001 still gates paid execution, worker dispatch, and final experiment scheduling; its unresolved numbers do not block writing or reviewing these drafts in the current discussion. No subscription or separately billed API choice is inferred from the owner's request to continue.

Remaining acceptance decisions: review the defaults, choose stack and exact schemas, define operating budgets, identify actual models/runtimes and review resources, and validate the contract scenario mapping. The task remains a draft until its full obligations and review requirements are satisfied.
