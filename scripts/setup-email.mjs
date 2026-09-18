// Reads the local token without printing credentials. Safe to rerun.
// node --env-file=.env scripts/setup-email.mjs --destination ADDRESS [--apply]
import assert from "node:assert/strict";
const args = process.argv.slice(2);
assert(
  args[0] === "--destination" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args[1]) &&
    (args.length === 2 || (args.length === 3 && args[2] === "--apply")),
  "Supply --destination ADDRESS [--apply]",
);
const destination = args[1];
const apply = args.includes("--apply");
assert(process.env.CLOUDFLARE_API_TOKEN, "Load .env with node --env-file=.env");
const request = async (path, method = "GET", body) => {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!result.success)
    throw Error(
      `${method} ${path}: ${response.status} ${JSON.stringify(result.errors)}`,
    );
  return result.result;
};
const zones = await request("/zones?name=annasdadpress.com");
assert(zones.length === 1, "Expected exactly one domain");
const zone = zones[0];
const root = `/zones/${zone.id}`;
const account = `/accounts/${zone.account.id}`;
// Complete permission and conflict checks before any mutation.
const settings = await request(root + "/email/routing");
const addresses = await request(account + "/email/routing/addresses");
const rules = await request(root + "/email/routing/rules");
const mx = await request(root + "/dns_records?type=MX");
assert(
  mx.every((r) => r.content.endsWith(".mx.cloudflare.net")),
  "Existing non-Cloudflare mail service: review before changing MX records",
);
const existing = rules.filter((r) =>
  r.matchers.some((m) => m.value === "alex@annasdadpress.com"),
);
assert(existing.length <= 1, "Multiple alex routes need review");
if (existing.length)
  assert(
    existing[0].actions.length === 1 &&
      existing[0].actions[0].type === "forward" &&
      existing[0].actions[0].value.length === 1 &&
      existing[0].actions[0].value[0] === destination,
    "Existing alex route has a different destination",
  );
let address = addresses.find((a) => a.email === destination);
console.log(
  JSON.stringify(
    {
      enabled: settings.enabled,
      destinationVerified: !!address?.verified,
      ruleEnabled: !!existing[0]?.enabled,
    },
    null,
    2,
  ),
);
if (!apply) process.exit(0);
if (!address) {
  address = await request(account + "/email/routing/addresses", "POST", {
    email: destination,
  });
  console.log(
    "Destination registered; check its inbox for Cloudflare verification.",
  );
}
if (!address.verified) {
  console.log(
    "Waiting for destination verification. Rerun after following the Cloudflare email link.",
  );
  process.exitCode = 2;
} else {
  if (!settings.enabled) await request(root + "/email/routing/dns", "POST", {});
  const body = {
    name: "Publisher contact",
    enabled: true,
    matchers: [
      { type: "literal", field: "to", value: "alex@annasdadpress.com" },
    ],
    actions: [{ type: "forward", value: [destination] }],
  };
  if (!existing.length)
    await request(root + "/email/routing/rules", "POST", body);
  else if (!existing[0].enabled)
    await request(root + "/email/routing/rules/" + existing[0].id, "PUT", body);
  const finalSettings = await request(root + "/email/routing");
  const finalRules = await request(root + "/email/routing/rules");
  assert(
    finalSettings.enabled &&
      finalRules.some(
        (r) =>
          r.enabled &&
          r.matchers.some((m) => m.value === "alex@annasdadpress.com") &&
          r.actions.some(
            (a) => a.type === "forward" && a.value.includes(destination),
          ),
      ),
    "Routing setup not yet active",
  );
  console.log(
    "Cloudflare forwarding for alex@annasdadpress.com is enabled with a verified destination.",
  );
}
