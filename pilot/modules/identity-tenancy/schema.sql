CREATE SCHEMA IF NOT EXISTS identity;
CREATE TABLE IF NOT EXISTS identity.principals (
 id uuid PRIMARY KEY, issuer text NOT NULL, subject text NOT NULL, active boolean NOT NULL DEFAULT true,
 UNIQUE(issuer,subject));
CREATE TABLE IF NOT EXISTS identity.tenants (id uuid PRIMARY KEY,name text NOT NULL);
CREATE TABLE IF NOT EXISTS identity.memberships (
 principal_id uuid REFERENCES identity.principals(id),tenant_id uuid REFERENCES identity.tenants(id),
 role text NOT NULL CHECK(role IN ('owner','staff')),active boolean NOT NULL DEFAULT true,
 PRIMARY KEY(principal_id,tenant_id));
CREATE TABLE IF NOT EXISTS identity.grants (
 principal_id uuid REFERENCES identity.principals(id),tenant_id uuid REFERENCES identity.tenants(id),
 shop_id uuid NOT NULL,active boolean NOT NULL DEFAULT true,PRIMARY KEY(principal_id,shop_id));
CREATE TABLE IF NOT EXISTS identity.sessions (
 hash text PRIMARY KEY,principal_id uuid NOT NULL REFERENCES identity.principals(id),
 csrf text NOT NULL,created_at timestamptz NOT NULL,seen_at timestamptz NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS identity.transactions (
 binding_hash text PRIMARY KEY,state text NOT NULL,nonce text NOT NULL,verifier text NOT NULL,expires_at timestamptz NOT NULL);
