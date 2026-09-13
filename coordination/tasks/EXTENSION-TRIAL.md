# EXTENSION-TRIAL — Public catalog consumer helpers

Packet revision 1; contract PublicProduct 0.1-draft; obligations EXT-01–06.
Coordinator /root owns grants, tests and integration. Grant-specific worker workspace and identity are supplied by the coordinator on dispatch. Generation 1. All baseline context is this packet, AGENTS.md, the public catalog contract, existing storefront module, and the frozen acceptance test.

Implement only pilot/modules/storefront/select-products.mjs and summarize-products.mjs. No dependencies. Inputs are already valid PublicProduct arrays from the public API (strict producer validation stays upstream). Do not access persistence, alter the public producer or change tests.

- selectProducts(products, options={}): new array of original objects, stable input order, no mutations; optional query is a trimmed, case-insensitive title substring. Optional minPrice/maxPrice are inclusive integer minor units in [0,100000000]. Reject non-integer/out-of-range/reversed bounds with RangeError. Unspecified bounds impose no bound.
- summarizeProducts(products): {count,minPrice,maxPrice,currency:'EUR'}, where bounds are integer minor units, or null for an empty array. No mutation.

Run: node --test pilot/tests/contracts/consumer-extension.test.mjs. Six named obligations must pass. Observe the initial red run, implement, then run green. Do not read other worktrees or receive another cohort's solution. Shared OS isolation is procedural; disclose this limitation. No commit or push. Return exact changed paths, UTC start/end and test output.

Budget: up to 90 active worker minutes, 15-minute checkpoints; no separate billed API calls. Trials run sequentially at the same revision; only model allocation changes. No claim of concurrency improvement or generalized model superiority is possible from one pair.
