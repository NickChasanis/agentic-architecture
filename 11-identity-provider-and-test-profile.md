# 11. Identity provider and test profile

[Overview](README.md) · [Identity/access contract](contracts/identity-and-access.md) · [Acceptance scenarios](contracts/acceptance-scenarios.md)

Status: proposed, recorded 2026-09-11T17:55:27Z. This develops the OIDC proposal into a concrete pilot profile. No provider container, client registration, credential, certificate, or authentication runtime has been created.

## Proposed choice

Use a local Keycloak instance as the controlled OIDC provider and `openid-client` in the Fastify backend as the protocol client. Angular uses the application's session/discovery endpoints; it does not implement provider token exchange. Keycloak documents a Docker-based setup with OIDC clients, and `openid-client` documents authorization code flow with PKCE. These establish available building blocks, not tested compatibility of this project. Sources: [Keycloak Docker guide](https://www.keycloak.org/getting-started/getting-started-docker), [openid-client](https://github.com/panva/openid-client).

This adds a provider process and setup cost, but gives the experiment a real login path and controlled synthetic identities without depending on a commercial hosted account. Machine/container resource costs still exist. If the overhead proves disproportionate, revisit the choice explicitly and label any fixture-only alternative's reduced evidence scope.

Use one dedicated pilot realm, separate from the administrative realm. Commerce tenants A/B remain local application authorization records inside that same identity realm; do not equate a commerce tenant with a separate provider deployment or realm. That separation tests whether our own authorization actually works.

## Configuration contract

| Item | Proposed requirement |
|---|---|
| Provider issuer | One configured HTTPS issuer reachable under the same canonical hostname by the backend and test browser. Never replace it with a container alias during validation. |
| Realm | Dedicated synthetic-user realm for this test environment; no production identity import. |
| OIDC client | Backend confidential client, authorization code flow with PKCE S256, exact callback URI, no implicit/password grant or wildcard redirect. |
| Scope | `openid`; add optional profile data only if a real consumer requirement appears. Application membership is never inferred from email or provider role claims. |
| Redirect response mode | Query callback for the proposed GET callback route; callback transaction checks remain mandatory. |
| Provider/admin credentials | Generated for the environment and injected locally; no example default password promoted to deployment configuration. |
| Client secret | Backend-only environment secret; no frontend bundle, committed fixture, or trace exposure. |
| Session persistence | Application session records in application-controlled PostgreSQL storage, owned by identity/tenancy; provider storage remains separately owned. |
| TLS and origins | Merchant/API and issuer certificates trusted by both browser and backend. Pin explicit origins/callbacks in the environment manifest. |
| Version record | Pin provider image/digest, Node/library versions, and relevant client configuration before the baseline; no floating image tags in a measured run. |

Do not copy the provider's quickstart development mode or sample credentials into an exposed environment. Local topology and CPU/RAM availability still need inspection before a container is started. The accepted stack decision did not approve this provider specifically.

## Fixture lifecycle and subject mapping

Maintain a declarative realm/client fixture and a separate application fixture defining the personas from IDENTITY-ACCESS. Obtain each synthetic user's actual subject after provisioning and map the configured issuer/subject to the intended local principal. Never assume the username equals the OIDC subject or that a reset preserves all generated identifiers.

Keycloak supports realm import/export, but startup import skips a realm that already exists. A successful startup therefore does not prove the latest fixture was applied. Use an isolated test environment with a known fixture revision and verify imported settings/users; define an explicit reset procedure before execution. Import/export also omits some runtime state and is not a full session backup. See [Keycloak import/export](https://www.keycloak.org/server/importExport).

Each independent mutable test run receives isolated provider/application state or carefully scoped identities and resources under one controlled test owner. Do not let two workers reset the same realm/database. Preserve actual reset commands and fixture revisions in the task packet once implementation exists.

## Test division

| Layer | Uses | What it can establish |
|---|---|---|
| Pure permission tests | In-memory principal/membership/grant values | Role-matrix logic, including revoked or wrong-shop permissions. |
| API/database contract tests | Controlled principal adapter inside the test process, real application persistence | Resource-scoping and mutation behavior; not login/session proof. |
| OIDC adapter tests | Controlled protocol responses and selected real-provider cases | Invalid issuer/audience/signature/state/nonce and failure handling; label response doubles explicitly. |
| Browser login/integration | Real Keycloak synthetic user, backend callback, real session cookie, actual API/database | Login, discovery, shop creation, draft/publication, and public visibility as a connected journey. |
| Session/CSRF tests | Real application session mechanism and controlled clock/requests | Expiry, logout, rotation, origin/token validation, and no mutation on denial. |

Use a fresh isolated browser context for personas whose provider login state must differ. Reusing an authenticated browser state may speed later application scenarios, but at least one full login flow must be exercised at the integrated revision. Preserve test evidence without publishing session cookies, authorization codes, tokens, or passwords in this public repository.

## Schema-freeze checklist

Before implementation workers consume a stable contract version, review together:

1. The owner/staff grant matrix, OIDC/application-session boundary, discovery results, and same-origin topology.
2. The provider/library choice and exact version/configuration manifest, with no assumed live installation.
3. Commerce draft defaults: validation limits, EUR-only price, non-paginated bounded fixtures, and last-commit draft updates.
4. Common errors plus auth/CSRF errors, complete operation-to-schema mapping, and generated-client compatibility.
5. AUTH/PUB/WORK obligations, evidence locations, real-versus-injected identity labels, task budgets, and independent review responsibility.

Canonical schema authoring can proceed as draft work; unresolved points prevent promoting the schemas to an accepted worker baseline. Avoid making every worker wait for an entire platform: freeze only the foundation and publication surfaces used by this experiment.

Sources checked 2026-09-11. Provider selection is still a proposal. Next implementation-facing work is draft machine-readable schemas/operation manifests and a foundation task packet after the identity direction is settled; no production login-readiness claim follows from this profile.
