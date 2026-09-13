"""Offline schema and manifest checks; no server, browser, or identity-provider proof."""
import copy
import json
import re
from datetime import datetime
from pathlib import Path

from jsonschema import Draft7Validator, FormatChecker

formats = FormatChecker()


@formats.checks("date-time", raises=(ValueError, TypeError))
def valid_timestamp(value):
    """Explicit calendar checking: optional jsonschema format extras may be absent."""
    if not isinstance(value, str):
        return True  # The schema's type constraint handles this.
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed.tzinfo is not None

ROOT = Path(__file__).resolve().parent
bundle = json.loads((ROOT / "schemas/wire.schema.json").read_text())
manifest = json.loads((ROOT / "operations/http.json").read_text())
Draft7Validator.check_schema(bundle)
assert (ROOT / "operations" / manifest["schemaFile"]).resolve() == ROOT / "schemas/wire.schema.json"
assert manifest["schemaDialect"] == bundle["$schema"]


def consumer_view(value):
    """Derive tolerant responses from canonical definitions; never relax inputs."""
    if isinstance(value, list):
        return [consumer_view(item) for item in value]
    if isinstance(value, dict):
        return {key: True if key == "additionalProperties" and item is False
                else consumer_view(item) for key, item in value.items()}
    return value


def validator(name, consumer=False):
    assert name in bundle["definitions"], name
    schema = copy.deepcopy(bundle)
    if consumer:
        schema = consumer_view(schema)
    schema["$ref"] = "#/definitions/" + name
    return Draft7Validator(schema, format_checker=formats)


ids, routes = set(), set()
scenario_text = (ROOT.parents[1] / "contracts/acceptance-scenarios.md").read_text()
for op in manifest["operations"]:
    assert op["id"] not in ids, "duplicate operation ID"
    ids.add(op["id"])
    route = (op["method"], op["path"])
    assert route not in routes, "duplicate route"
    routes.add(route)
    for name in [op["paramsSchema"], op["querySchema"], op["bodySchema"], op["success"]["bodySchema"]]:
        if name is not None:
            validator(name)
    params = bundle["definitions"][op["paramsSchema"]]
    assert set(re.findall(r"\{([^}]+)\}", op["path"])) == set(params["required"])
    assert all(code in manifest["errorStatusByCode"] for code in op["errorCodes"])
    assert all(re.search(r"\| " + re.escape(item) + r" \|", scenario_text) for item in op["obligations"])
    if op["authentication"] == "session" and op["method"] in ("POST", "PUT", "PATCH", "DELETE"):
        assert op["csrfRequired"] and "CSRF_REJECTED" in op["errorCodes"]
    if op["success"]["status"] in (204, 302, 303):
        assert op["success"]["bodySchema"] is None
    if op["success"]["status"] in (302, 303):
        assert "Location" in op["successHeaders"]
assert ids == {f"HTTP-{i:02}" for i in range(1, 9)} | {f"ID-{i:02}" for i in range(1, 7)}
assert set(manifest["errorStatusByCode"]) == set(bundle["definitions"]["ErrorEnvelope"]["properties"]["error"]["properties"]["code"]["enum"])

uuid = "11111111-1111-4111-8111-111111111111"
draft = {"title": "Notebook", "description": "", "price": {"amountMinor": 1250, "currency": "EUR"}}
public = {"id": uuid, **draft}
merchant = {**public, "tenantId": uuid, "shopId": uuid, "status": "draft"}
shop = {"id": uuid, "tenantId": uuid, "name": "Shop", "slug": "shop-one"}
membership = {"tenantId": uuid, "name": "Tenant", "role": "owner", "canCreateShop": True}
cases = []


def case(label, name, value, expected=True, consumer=False):
    cases.append((label, name, value, expected, consumer))


case("valid draft", "DraftInput", draft)
case("empty publication body", "EmptyObject", {})
case("merchant list both states", "MerchantProductList", {"items": [merchant, {**merchant, "status": "published"}]})
case("merchant list empty", "MerchantProductList", {"items": []})
case("merchant list invalid state", "MerchantProductList", {"items": [{**merchant, "status": "private"}]}, False)
case("merchant list default query", "MerchantListQuery", {})
case("merchant list filter", "MerchantListQuery", {"status": "draft"})
case("merchant list invalid filter", "MerchantListQuery", {"status": "all"}, False)
case("merchant list query extension", "MerchantListQuery", {"page": "1"}, False)
case("null is not absent/empty body", "EmptyObject", None, False)
case("extra publication field", "EmptyObject", {"tenantId": uuid}, False)
case("missing draft title", "DraftInput", {k: v for k, v in draft.items() if k != "title"}, False)
case("whitespace title", "DraftInput", {**draft, "title": " \t\n"}, False)
case("Unicode title limit", "DraftInput", {**draft, "title": "🟣" * 120})
case("overlong Unicode title", "DraftInput", {**draft, "title": "🟣" * 121}, False)
case("long description", "DraftInput", {**draft, "description": "x" * 2001}, False)
case("unknown top-level input", "DraftInput", {**draft, "status": "published"}, False)
for label, amount, valid in [("zero", 0, True), ("maximum", 100000000, True), ("negative", -1, False), ("over maximum", 100000001, False), ("fraction", 1.5, False), ("numeric string", "1250", False), ("boolean", True, False)]:
    case(label + " price", "Price", {"amountMinor": amount, "currency": "EUR"}, valid)
case("wrong currency", "Price", {"amountMinor": 1, "currency": "USD"}, False)
case("nested extra input", "DraftInput", {**draft, "price": {**draft["price"], "tax": 1}}, False)
case("valid shop", "Shop", shop)
case("valid shop input", "CreateShopInput", {"name": "Shop", "slug": "shop-one"})
for slug in ("UPPER", "--bad", "ab", "shop_1", "shop\n"):
    case("invalid slug " + repr(slug), "Slug", slug, False)
case("uppercase UUID", "Uuid", "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA", False)
case("UUID trailing newline", "Uuid", uuid + "\n", False)
case("valid public product", "PublicProduct", public)
case("public privacy leak", "PublicProduct", {**public, "tenantId": uuid}, False)
case("nested public privacy leak", "PublicProduct", {**public, "price": {**draft["price"], "internalCost": 1}}, False)
case("tolerant consumer addition", "PublicProduct", {**public, "label": "new"}, True, True)
case("tolerant consumer still requires price", "PublicProduct", {"id": uuid, "title": "Title", "description": ""}, False, True)
case("tolerant consumer rejects wrong amount type", "PublicProduct", {**public, "price": {"amountMinor": "1", "currency": "EUR"}}, False, True)
case("draft response", "DraftProduct", merchant)
case("published cannot be draft response", "DraftProduct", {**merchant, "status": "published"}, False)
case("published response", "PublishedProduct", {**merchant, "status": "published"})
case("draft cannot be publish success", "PublishedProduct", merchant, False)
case("public list", "PublicProductList", {"items": [public]})
case("empty shop list", "AuthorizedShopList", {"items": []})
case("membership list", "TenantMembershipList", {"items": [membership]})
case("owner capability mismatch", "TenantMembership", {**membership, "canCreateShop": False}, False)
case("staff capability mismatch", "TenantMembership", {**membership, "role": "staff"}, False)
session = {"principal": {"id": uuid}, "csrfToken": "synthetic-token", "absoluteExpiresAt": "2026-09-11T20:00:00Z"}
case("session view", "SessionView", session)
case("invalid calendar date", "SessionView", {**session, "absoluteExpiresAt": "2026-02-30T20:00:00Z"}, False)
case("non-UTC timestamp", "SessionView", {**session, "absoluteExpiresAt": "2026-09-11T20:00:00+02:00"}, False)
case("session token leak", "SessionView", {**session, "accessToken": "synthetic"}, False)
case("callback code", "OidcCallbackQuery", {"state": "s", "code": "c", "iss": "https://issuer.invalid"})
case("callback provider error", "OidcCallbackQuery", {"state": "s", "error": "access_denied"})
case("callback extension", "OidcCallbackQuery", {"state": "s", "code": "c", "provider_extension": "v"})
case("callback code and error", "OidcCallbackQuery", {"state": "s", "code": "c", "error": "denied"}, False)
case("callback missing state", "OidcCallbackQuery", {"code": "c"}, False)
case("callback duplicate query array", "OidcCallbackQuery", {"state": "s", "code": ["a", "b"]}, False)
case("callback missing outcome", "OidcCallbackQuery", {"state": "s"}, False)
case("application rejects query extensions", "EmptyObject", {"page": "2"}, False)
for code in manifest["errorStatusByCode"]:
    case("error " + code, "ErrorEnvelope", {"error": {"code": code, "message": "Generic error."}})
field = {"path": "/price/amountMinor", "code": "OUT_OF_RANGE"}
case("validation details", "ErrorEnvelope", {"error": {"code": "VALIDATION_FAILED", "message": "Invalid request.", "fields": [field]}})
case("details on private-resource error", "ErrorEnvelope", {"error": {"code": "RESOURCE_NOT_FOUND", "message": "Not found.", "fields": [field]}}, False)
case("leaked rejected value", "ErrorEnvelope", {"error": {"code": "VALIDATION_FAILED", "message": "Invalid request.", "fields": [{**field, "value": "secret"}]}}, False)
case("unknown error code", "ErrorEnvelope", {"error": {"code": "DATABASE_FAILURE", "message": "Failure."}}, False)

failures = []
for label, name, value, expected, consumer in cases:
    actual = validator(name, consumer).is_valid(value)
    if actual != expected:
        failures.append(f"{label}: expected {expected}, got {actual}")
if failures:
    raise SystemExit("\n".join(failures))
print(f"PASS: {len(bundle['definitions'])} schema definitions, {len(ids)} operation mappings, {len(cases)} payload cases.")
print("Scope: offline payload/manifest checks only; no HTTP, authorization, OIDC, database or browser checks.")
