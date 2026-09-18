import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  rm,
  copyFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";
const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const specs = JSON.parse(
  await readFile(resolve(root, "src/samples/selections.json")),
);
if (
  ![2, 4].includes(args.length) ||
  args[0] !== "--source" ||
  (args.length === 4 && (args[2] !== "--book" || !specs[args[3]]))
)
  throw Error(
    "Usage: npm run samples:sync -- --source ../sudoku-challenges [--book guide|advent-2026|practice-xwing|start-here|candidates-done|mastery]",
  );
const keys = args[3] ? [args[3]] : Object.keys(specs);
const temp = await mkdtemp(resolve(tmpdir(), "press-samples-"));
try {
  const manifests = {};
  // Complete validation and rendering for every selection before replacing assets.
  for (const key of keys) {
    execFileSync(
      "nix",
      [
        "develop",
        "-c",
        "python",
        resolve(root, "scripts/export-samples.py"),
        resolve(root, "src/samples/selections.json"),
        key,
        temp,
      ],
      { cwd: resolve(args[1]), stdio: "inherit" },
    );
    const manifest = JSON.parse(await readFile(resolve(temp, `${key}.json`)));
    manifest.assets = {};
    for (const page of manifest.spread.pages) {
      for (const width of [640, 1280]) {
        await sharp(resolve(temp, page.image + ".png"))
          .resize(width)
          .webp({ quality: 92 })
          .toFile(resolve(temp, `${page.image}-${width}.webp`));
      }
    }
    const names = [
      `${key}-sample.pdf`,
      ...manifest.spread.pages.flatMap((p) =>
        [640, 1280].map((w) => `${p.image}-${w}.webp`),
      ),
    ];
    for (const name of names)
      manifest.assets[name] = createHash("sha256")
        .update(await readFile(resolve(temp, name)))
        .digest("hex");
    manifests[key] = manifest;
  }
  const target = resolve(root, "public/assets/samples");
  await mkdir(target, { recursive: true });
  for (const [key, manifest] of Object.entries(manifests)) {
    for (const name of Object.keys(manifest.assets))
      await copyFile(resolve(temp, name), resolve(target, name));
    await writeFile(
      resolve(root, `src/samples/${key}.json`),
      JSON.stringify(manifest, null, 2) + "\n",
    );
  }
  if (keys.includes("guide"))
    await copyFile(
      resolve(target, "guide-sample.pdf"),
      resolve(target, "sudoku-learners-guide-x-wing-sample.pdf"),
    );
} finally {
  await rm(temp, { recursive: true, force: true });
}
