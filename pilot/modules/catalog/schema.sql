CREATE SCHEMA IF NOT EXISTS catalog;
CREATE TABLE IF NOT EXISTS catalog.products (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, shop_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN ('draft','published')),
 title text NOT NULL, description text NOT NULL,
 amount_minor integer NOT NULL CHECK(amount_minor BETWEEN 0 AND 100000000),
 currency text NOT NULL CHECK(currency='EUR'),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 published_at timestamptz,
 FOREIGN KEY(shop_id,tenant_id) REFERENCES shops.shops(id,tenant_id),
 CHECK((status='draft' AND published_at IS NULL) OR (status='published' AND published_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS products_public_idx ON catalog.products(shop_id,status,id);
-- Unfiltered merchant pages need shop/id order without sorting all shop rows.
CREATE INDEX IF NOT EXISTS products_shop_page_idx ON catalog.products(shop_id,id);
