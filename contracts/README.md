# Commerce pilot contract drafts

Status: proposed contracts for discussion, originally created 2026-09-11T14:11:23Z. The [machine-readable draft](../pilot/contracts/README.md) now supplies schemas and passing offline payload checks. These are not accepted production interfaces or evidence of a running application.

- [Commerce publication](commerce-publication.md): product behavior and provider/consumer boundaries.
- [Commerce HTTP API](commerce-http-api.md): proposed routes, exact payload fields, validation, errors, and concurrency semantics.
- [Identity and access](identity-and-access.md): proposed OIDC/session boundary, tenant discovery, shop permissions, and authentication scenarios.
- [Assignment and work submission](work-submission.md): current-task identity, ownership, messages, and result acceptance.
- [Acceptance scenarios](acceptance-scenarios.md): checks to implement and evidence to collect.
- [Foundation readiness self-review](reviews/2026-09-12-foundation-readiness.md): unresolved decisions and the dependency order for both tracks; not independent acceptance.

The coordinator acts as the proposed steward for both contracts. Affected consumer requirements and independent review must inform acceptance. Implementation agents cannot change these contracts unilaterally. Exact schema files and runnable commands follow stack/environment selection; those are not prerequisites for reviewing the behavior here.

The accepted modular-backend direction is developed in the [dependency and contract-ownership map](../09-module-dependencies-and-ownership.md). Use its provider/consumer relationships to review these drafts; the map does not accept the remaining wire schemas or authorize assignments.

## Concrete defaults and decision status

1. Publication changes a draft to published atomically; repeating it returns the same published product without duplicate effects.
2. **Accepted:** only drafts can be edited; published products remain immutable in this pilot. See [PUBLICATION-001](../coordination/decisions/PUBLICATION-001-immutable-pilot.md). Unpublishing, deletion and pagination remain outside the proposed first slice. The HTTP draft proposes last-committed replacement for competing draft edits; that policy still needs review/acceptance.
3. A successful publish response means a subsequent public read started after that response sees the published version. Reads overlapping publication may observe the previous state.
4. A second consumer is a small read-only catalog listing using the public API. Its internal implementation and UI may differ from the first storefront.
5. Current assignment identity and contract versions control work acceptance. Dates identify activity but do not confer ownership.

Only the immutability rule above is newly accepted; the other defaults remain proposed. Multi-agent refactoring and changes ranging from minimal patches to project-wide work are [reserved for later discussion](../coordination/tasks/REFACTOR-001.md). They do not expand this experiment's current scope.

## Dependency clarification

Behavioral drafting can proceed after the setting decision. BUDGET-001 still gates paid execution, worker dispatch, and final experiment scheduling; its unresolved numbers do not block writing or reviewing these drafts in the current discussion. No subscription or separately billed API choice is inferred from the owner's request to continue.

Remaining acceptance decisions: review the defaults and exact schemas, define operating budgets, identify actual models/runtimes and review resources, and validate the contract scenario mapping. The task remains a draft until its full obligations and review requirements are satisfied.

Update: [STACK-001](../coordination/decisions/STACK-001-commerce-pilot.md) settles the stack family and layout. The HTTP draft develops wire details, but authentication, versions, schema acceptance, and budgets still require resolution.
