# SETTING-001 — Commerce publication experiment

- Decision: accepted by the human owner.
- Recorded at: 2026-09-11T14:05:10Z.
- Owner instruction: “use the commerce publication example”.
- Artifact revision: 1.
- Source baseline inspected: `d52536707abc583230a4fdcc26b8b34b7ab32724`.
- Scope: select the example and its previously proposed journey; this does not grant implementation assignments or spending authority.

## Setting and first journey

Use the [commerce publication example](../../03-enterprise-delivery-example.md). No commerce application exists in this repository; this is a greenfield experiment setting.

An authenticated merchant creates a shop, creates a draft product, and publishes it. A shopper sees the published product on the correct storefront. A draft stays invisible publicly; another shop or tenant cannot expose the product or mutate it without authorization. Use two tenants and multiple shops to make those boundaries observable.

The example's publication-visibility assumption remains visibility on the next completed read, including relevant cache invalidation. The contract specification must formalize that behavior, repeated publication, errors, and safe public fields before dependent implementation.

Non-goals for the first slice: cart, checkout, payment processing, merchant subscriptions, production release, custom orchestration infrastructure beyond the selected pilot, and a full commerce platform.

## Extension and paired coordination work

The planned product extension is a second catalog consumer using the same public publication/read contract. Preserve existing storefront obligations; record provider changes, contract changes, clarification needs, integration rework, and time to verification. The second consumer's concrete presentation is still a design choice.

Track B exercises assignment requests/grants, current task and contract versions, shared message records, artifact submission, and evidence-based integration status through the supervised Markdown workflow. Failure scenarios include an obsolete task packet, conflicting claim requests, and a late result from a superseded assignment. The later adapter-replacement exercise remains in the roadmap; selecting a second runtime is still open.

## Decision verification

| Obligation | Evidence | Result |
|---|---|---|
| SET-01 — setting and existing code | Owner selected the commerce example; current repository is discussion/coordination documents and artwork. | Satisfied for this decision. |
| SET-02 — journey, non-goals, extension | First journey and extension sections above, consistent with documents 3–5. | Satisfied for this decision. |
| SET-03 — coordination capabilities | Paired coordination scope above. | Satisfied for this decision. |
| SET-04 — owner choice and unknowns | Owner instruction and remaining decisions below. | Satisfied for this decision. |

This is coordinator review of a human-resolved discussion task, not independent implementation review. No application, browser scenario, agent exchange, or compatibility check has been executed.

## Remaining decisions

- Troubleshooting, escalation, and experiment budgets; accounting basis and review/checkpoint cadence.
- Application stack, implementation workspace/repository, local environment, and runnable commands.
- Exact contract schemas, supported consumer combinations, and required acceptance checks.
- Concrete models and worker runtimes, permissions, and resource allocation.

Next action: settle BUDGET-001 for this bounded scope, then specify the paired contracts before dispatching implementation work.
