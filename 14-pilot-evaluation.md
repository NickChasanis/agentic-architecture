# 14. Pilot evaluation and decision

The pilot ends when the second catalog consumer and coordination recovery exercises pass on one integrated revision. Report product compatibility and coordination conformance separately. Required failures, stale results, unavailable environments and unmeasured costs remain visible.

## Observed result

- Product compatibility: pass. The second consumer uses only the public projection; catalog and browser obligations remain green.
- Coordination conformance: pass for deterministic registry, stale-generation rejection, reassignment and adapter capability checks.
- Extension surface: one new storefront module and consumer tests; no catalog storage changes were required.
- Cost and throughput: unavailable. This pilot did not run paid models or a controlled sequential-vs-parallel benchmark.

## Decision

**Adopt** the contract-first boundaries and evidence gates for future experiments. **Revise** before autonomous use: the registry and tmux harness are local/manual-support components, not a production scheduler. **Stop** any claim of model-cost or speed improvement until comparable controlled runs exist.
