// One entry point for cover, interior, and share-card updates.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
const args = process.argv.slice(2);
const specs = JSON.parse(
  await readFile(new URL("../src/samples/selections.json", import.meta.url)),
);
if (
  ![2, 4].includes(args.length) ||
  args[0] !== "--source" ||
  (args.length === 4 && (args[2] !== "--book" || !specs[args[3]]))
)
  throw Error(
    "Usage: npm run books:refresh -- --source ../sudoku-challenges [--book KEY]",
  );
const keys = args[3] ? [args[3]] : Object.keys(specs);
for (const key of keys)
  execFileSync(
    process.execPath,
    ["scripts/sync-covers.mjs", "--source", args[1], "--book", key],
    { stdio: "inherit", env: { ...process.env, SKIP_BOOK_COMPANIONS: "1" } },
  );
execFileSync(process.execPath, ["scripts/sync-samples.mjs", ...args], {
  stdio: "inherit",
});
execFileSync(process.execPath, ["scripts/render-social.mjs"], {
  stdio: "inherit",
});
console.log(
  "Review the asset/provenance diff, then run npm run build and npm test before publishing.",
);
