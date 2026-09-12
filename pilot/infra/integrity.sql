-- Integration-owned cross-module constraints, installed after both module schemas.
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='shops_id_tenant_unique' AND conrelid='shops.shops'::regclass) THEN
  ALTER TABLE shops.shops ADD CONSTRAINT shops_id_tenant_unique UNIQUE(id,tenant_id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='grant_shop_tenant' AND conrelid='identity.grants'::regclass) THEN
  ALTER TABLE identity.grants ADD CONSTRAINT grant_shop_tenant FOREIGN KEY(shop_id,tenant_id) REFERENCES shops.shops(id,tenant_id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='shop_tenant' AND conrelid='shops.shops'::regclass) THEN
  ALTER TABLE shops.shops ADD CONSTRAINT shop_tenant FOREIGN KEY(tenant_id) REFERENCES identity.tenants(id);
 END IF;
END $$;
