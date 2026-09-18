import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const args = process.argv.slice(2);
const review = args.at(-1) === "--review";
if (review) args.pop();
if (
  ![2, 4].includes(args.length) ||
  args[0] !== "--source" ||
  (args.length === 4 &&
    (args[2] !== "--book" ||
      ![
        "guide",
        "advent-2026",
        "candidates-done",
        "start-here",
        "practice-xwing",
        "mastery",
      ].includes(args[3])))
)
  throw new Error(
    "Usage: npm run covers:sync -- --source ../sudoku-challenges [--book guide|advent-2026|candidates-done|start-here|practice-xwing|mastery] [--review]",
  );
const book = args[3] || "guide";
if (review && book === "mastery")
  throw new Error("Mastery requires its paired print exports; omit --review.");
const root = fileURLToPath(new URL("../", import.meta.url));
const temp = await mkdtemp(resolve(tmpdir(), `${book}-cover-`));
const target = resolve(root, `src/assets/covers/${book}`);
try {
  execFileSync(
    "nix",
    [
      "develop",
      "-c",
      "python",
      resolve(root, "scripts/export-cover.py"),
      temp,
      book,
      ...(review ? ["review"] : []),
    ],
    {
      cwd: resolve(args[1]),
      stdio: "inherit",
    },
  );
  const png = await sharp(resolve(temp, "front.png"))
    .toColourspace("srgb")
    .png()
    .toBuffer();
  const { width, height } = await sharp(png).metadata();
  const sha256 = createHash("sha256").update(png).digest("hex");
  const previous = await readFile(target + ".json", "utf8")
    .then(JSON.parse)
    .catch((e) => {
      if (e.code !== "ENOENT") throw e;
      return null;
    });
  const existing = await readFile(target + ".png").catch((e) => {
    if (e.code !== "ENOENT") throw e;
    return null;
  });
  if (
    previous?.sha256 === sha256 &&
    existing &&
    createHash("sha256").update(existing).digest("hex") === sha256
  ) {
    console.log(`${book} front cover unchanged; keeping existing provenance.`);
  } else {
    const source = JSON.parse(
      await readFile(resolve(temp, "source.json"), "utf8"),
    );
    const record = {
      schema: 1,
      artworkStatus: "print",
      width,
      height,
      sha256,
      ...source,
    };
    await mkdir(resolve(root, "src/assets/covers"), { recursive: true });
    await writeFile(target + ".png", png);
    await writeFile(target + ".json", JSON.stringify(record, null, 2) + "\n");
    console.log(
      `Imported ${book} front cover: ${width} x ${height}. Review, build, and commit to publish.`,
    );
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
