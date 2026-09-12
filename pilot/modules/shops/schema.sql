CREATE SCHEMA IF NOT EXISTS shops;
CREATE TABLE IF NOT EXISTS shops.shops (
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL,name text NOT NULL,
 slug text NOT NULL UNIQUE);
