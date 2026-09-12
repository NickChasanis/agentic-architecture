# IDENTITY-ACCESS — 0.1-draft

Recorded 2026-09-11T16:23:47Z. Status: proposed foundation contract, not an accepted identity-provider selection or implemented login. Owner/steward: coordinator. Providers: identity/tenancy module and its login/session adapter; Shops supplies trusted resource context. Consumers: merchant UI, Shops, catalog, and verification fixtures.

## Recommended login boundary

Use OpenID Connect authorization code flow with PKCE through the backend and an established OIDC client library. The browser receives an opaque application-session cookie; provider tokens stay server-side and are not placed in browser storage. Use a controlled provider with synthetic users for the pilot, so login can be tested without creating real customer accounts. The provider product, client-library version, and configuration are still to select.

The library must validate signature, configured issuer, audience and applicable authorized-party rules, token expiry, and the login transaction's state/nonce. Use PKCE S256, registered exact callback URLs, single-use login transactions, and a fixed post-login application destination. Do not derive redirect destinations from arbitrary request parameters. These requirements draw on [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) and [OAuth security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html).

Map external identity to an internal principal using the verified `(issuer, subject)` pair. Email and display name are not identity keys or evidence of tenant membership. If an identity has no local principal in this seeded pilot, deny access with a generic account-unavailable outcome; self-registration, invitations, account linking, password management, and recovery remain out of scope.

## Session and browser topology

Propose one HTTPS origin for the merchant client and its backend API through local routing/proxy configuration. Angular build applications may remain separate while the merchant API is same-origin. The public storefront can have a separate origin and makes anonymous public requests; it receives no merchant session access or credentialed CORS permission.

Use a server-side session store with an unpredictable opaque session ID and a `Secure`, `HttpOnly`, host-only cookie, `Path=/`, and `SameSite=Lax`. A `__Host-` cookie name is suitable with these attributes. Rotate the session ID on successful login; never reuse a supplied pre-login identifier. Proposed pilot expiry is 30 minutes idle and 8 hours absolute, enforced server-side. These durations are proposed local policy, not values prescribed by a standard. See [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

All authenticated mutation endpoints, including logout, require a session-bound synchronizer token in `X-CSRF-Token` and validation of the expected origin. Missing/invalid origin or token fails before mutation. Session introspection returns the token only to the same-origin authenticated client with no-store caching; it is not an authentication credential and must not appear in logs/URLs. Do not treat SameSite alone as CSRF protection. The OIDC callback instead uses its single-use state/nonce/PKCE transaction. See [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Validate the configured external origin and trusted-proxy behavior; do not trust arbitrary forwarded host headers. Local browser tests should exercise HTTPS and the real cookie attributes. Do not silently disable cookie/CSRF requirements to make tests pass. Detailed certificate/provider setup is a foundation deliverable.

Logout revokes the current application session, clears the cookie, and returns no content. Provider-wide single sign-out and logout from other devices are outside this first slice; logging into the provider may remain active after application logout. Tests must distinguish those lifecycles.

## Tenant membership and shop grants

Identity proves who the principal is. Local authorization records decide which actions that principal may take. Do not import provider roles as commerce permissions implicitly.

| Local record | Ownership and meaning |
|---|---|
| Principal | Identity module: internal UUID, verified external identity mapping, active/disabled status. |
| Tenant membership | Identity/tenancy module: principal/tenant association, active status, role `owner` or `staff`. |
| Shop grant | Identity/tenancy module: active staff membership plus a permitted shop ID; no grant is valid outside that shop's actual tenant. |
| Shop | Shops module: actual tenant association, immutable public slug in this pilot, and shop ID. |

| Action | Tenant owner | Staff with grant for this shop | Staff without grant / other tenant |
|---|---|---|---|
| Discover tenant membership | Own memberships only | Own memberships only | No discovery of other tenants |
| Create shop in tenant | Allowed | Denied | Denied |
| List merchant shops in tenant | All shops in owned tenant | Granted shops only | Empty list for active same-tenant staff without grants; inaccessible tenant returns 404 |
| Read merchant product / create or edit draft / publish | Allowed in owned tenant | Allowed in granted shop | Denied without revealing resource existence |
| Read public published product | Anonymous public rules | Anonymous public rules | Anonymous public rules |

These roles and capabilities are proposed pilot policy. There is no platform-wide superuser or implicit support bypass. Membership/grant administration is performed through controlled fixture setup in the first experiment; there is no administration API yet. Shop creation assigns ownership to the tenant through the creator's existing owner membership, not through a new client-supplied role.

For authorization, Shops provides trusted shop-to-tenant context; catalog supplies the product's actual shop association. Identity/tenancy checks the active principal, matching membership, role, and grant. It must not call back into catalog or acquire authorization context from an untrusted request body.

Recheck current principal/membership/grant state for each protected request; session creation does not freeze permissions. Proposed revocation guarantee: a protected request whose authorization check begins after committed revocation must deny access. A request already authorized may complete; stronger transactional revocation is not promised by this draft. Do not retain a stale permission snapshot in the session.

## Foundation endpoints

These are new proposed operations supplementing the [commerce API](commerce-http-api.md). Standard JSON errors use its envelope; redirects and 204 responses have no JSON success body. All auth/discovery responses are no-store.

| ID | Method and route | Input / output | Required behavior |
|---|---|---|---|
| ID-01 | `GET /api/v1/auth/login` | No caller-controlled redirect; `302` to configured provider | Establish bounded login transaction with state, nonce, and PKCE; no tenant grant occurs. |
| ID-02 | `GET /api/v1/auth/callback` | OIDC query response; success `303` to fixed merchant landing route | Library validates protocol response and transaction, maps active principal, rotates session; failure grants no session. |
| ID-03 | `GET /api/v1/auth/session` | `200 SessionView`; `401` without valid session | Supplies internal principal identity and CSRF token, no provider tokens or raw session ID. |
| ID-04 | `POST /api/v1/auth/logout` | `{}` plus session/CSRF/origin; `204` | Revoke current session and clear cookie; already invalid session returns `401`. |
| ID-05 | `GET /api/v1/merchant/tenants` | `200 TenantMembershipList` | Only active memberships for the principal; valid principal without memberships receives empty list. |
| ID-06 | `GET /api/v1/merchant/tenants/{tenantId}/shops` | `200 AuthorizedShopList` | Filter by permissions above; missing/inaccessible tenant returns generic 404. |

SessionView fields: `principal: { id: UUID }`, `csrfToken: nonempty opaque string`, `absoluteExpiresAt: UTC timestamp`. Do not claim absolute expiry guarantees validity until that time: idle expiry, disablement, or logout can invalidate earlier.

TenantMembershipList fields: `items: [{ tenantId: UUID, name: string, role: "owner" | "staff", canCreateShop: boolean }]`, ordered by tenantId. AuthorizedShopList fields: `items: [Shop]`, using the exact Shop response defined by the commerce API and ordered by shop ID. For this pilot, every returned shop permits its caller to read merchant products, draft, and publish; the UI must still handle authorization failure on the next action.

Names are display data and grants are server-derived. The UI never submits `canCreateShop` or roles to establish permission. Changing the selected tenant/shop is UI navigation followed by a scoped API call, not a session-wide mutable permission setting. Different browser tabs can operate different authorized shops without changing each other's authority.

## Errors and processing order

Extend the commerce envelope with `403 CSRF_REJECTED`, `400 LOGIN_RESPONSE_INVALID`, `401 LOGIN_FAILED`, `403 ACCOUNT_UNAVAILABLE`, and `503 IDENTITY_SERVICE_UNAVAILABLE`. Login failures contain generic messages without token/provider-account details. The exact mapping of provider failures to these categories belongs to the login adapter and must be reviewed before schema freeze.

For protected mutations: basic transport parsing, session authentication, CSRF/origin validation, resource authorization, then domain-state checks. Thus a missing session returns 401, a bad CSRF token returns 403, and a valid authenticated/CSRF request for an unauthorized shop/product returns 404 indistinguishable from a missing resource. Only an authorized product mutation can reveal `PRODUCT_IMMUTABLE`.

Public catalog endpoints never require a session and must apply the same published-only projection even if a merchant cookie happens to accompany the request. No draft preview is implicitly enabled by being logged in.

## Test personas and evidence

| Persona | Fixture permissions | Expected checks |
|---|---|---|
| Owner A | Owner membership in tenant A, shops A1/A2 | Create shop, discover/manage both shops, denied tenant B. |
| Staff A1 | Active staff membership A, grant A1 only | A1 operations allowed; A2/B1 hidden and denied. |
| Owner B | Owner membership in B, shop B1 | B1 allowed; A shops hidden and denied. |
| No-membership principal | Valid active principal, no memberships | Login/session valid, tenant list empty, merchant resources denied. |
| Disabled principal | Existing principal marked disabled | No new login/session access; existing protected requests fail on recheck. |
| Anonymous visitor | No session | Published storefront works; protected endpoints return 401. |

Real provider login with synthetic users is the proposed integrated gate. Isolated API tests may inject fixture principals through an in-process test adapter, but must report that proof boundary and never expose the adapter as a live HTTP login shortcut. Injected-principal tests do not count as successful OIDC/session integration.

Additional required scenarios: invalid issuer/audience/signature, replayed/mismatched/expired login transaction, session fixation, expiry/logout, missing/wrong CSRF token and origin, membership/grant revocation, cross-tenant identifier substitution, empty discovery, and absence of merchant data on public routes. Each check must name its actual runtime/artifact and whether identity was real-provider or injected.

## Next step and limits

The [provider/test profile](../11-identity-provider-and-test-profile.md) proposes local Keycloak plus the backend `openid-client` library, with explicit fixture/reset and evidence requirements. It does not select or provision a real environment automatically.

Draft schemas/operation manifests and synthetic Fastify adapter checks now exist; they do not implement this authentication approach. Review the approach and role matrix, select the controlled provider and compatible library versions, and resolve the [foundation-readiness findings](reviews/2026-09-12-foundation-readiness.md). Precise login transaction bounds, rate limits, provider settings, and fixture setup must be recorded before dispatch. No real login system, credential, provider registration, or paid service has been created by this document.

Sources consulted 2026-09-11. The referenced standards/guidance support protocol and session safeguards; the chosen endpoints, roles, deadlines, and pilot exclusions are our proposed design.
