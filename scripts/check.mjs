import { readdir, readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    files.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return files;
}
const files = (await walk("dist")).filter((p) => p.endsWith(".html"));
const base = (process.env.BASE_PATH || "").replace(/\/$/, "");
const titles = new Set();
let links = 0;
for (const file of files) {
  const html = await readFile(file, "utf8");
  assert(
    !html.includes("B000TEST00") && !html.includes("publisher@example.com"),
    `Fixture data leaked into ${file}`,
  );
  assert(!/[^\x00-\x7F]/.test(html), `Non-ASCII markup in ${file}`);
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  assert(!titles.has(title), `Duplicate title: ${title}`);
  titles.add(title);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
  assert(html.includes('rel="canonical"'));
  const schema = JSON.parse(
    html.match(/application\/ld\+json">(.*?)<\/script>/)[1],
  );
  if (schema["@type"] === "Book") {
    assert.equal(schema.author["@type"], "Person");
    assert.equal(schema.author.name, "Alex Nicolaou");
    assert.equal(schema.publisher.name, "Anna's Dad Press");
    assert(html.includes("by Alex Nicolaou"));
    assert(html.includes('id="sample-pages"'));
    assert(!html.includes("Print cover artwork"));
    assert(!html.includes("Sample pages are on their way"));
    assert(html.includes("/assets/social/"));
  }
  for (const [, href] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (!href.startsWith("/")) continue;
    const target = path.join("dist", href.slice(base.length).split("#")[0]);
    assert(
      await stat(target).catch(() => false),
      `Broken link in ${file}: ${href}`,
    );
    if (href.includes("#")) {
      const targetHtml = await readFile(
        href.split("#")[0].endsWith("/") ? target + "/index.html" : target,
        "utf8",
      );
      assert(targetHtml.includes(`id="${href.split("#")[1]}"`));
    }
    links++;
  }
}
// The first Mastery publication keeps its established URL and its own content.
const mastery = await readFile(
  "dist/books/mastery-hard-sudoku/index.html",
  "utf8",
);
assert(mastery.includes("Mastery! Advanced Sudoku"));
assert(
  mastery.includes("120 Carefully Graded Puzzles for Independent Solving"),
);
assert(mastery.includes("mastery-720.webp"));
assert(mastery.includes("Puzzles 91-120"));
assert(!mastery.includes("One picture to discover"));
assert(!mastery.includes("COVER FORTHCOMING"));
const discovery = await readFile(
  "dist/books/25-days-of-christmas-sudoku/index.html",
  "utf8",
);
assert(discovery.includes("One picture to discover"));
assert(!discovery.includes("Master the Grid"));
console.log(
  `Checked ${files.length} pages, unique titles, structured data, and ${links} internal links/assets.`,
);
if (process.env.STATIC_ONLY) process.exit(0);
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  stdio: "pipe",
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", (c) => reject(Error("Preview server exited: " + c)));
});
let browser;
try {
  browser = await chromium.launch();
  await mkdir("artifacts", { recursive: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const file of files) {
      const route = file.replace(/^dist/, "").replace(/index.html$/, "");
      await page.goto("http://127.0.0.1:4173" + route);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Horizontal overflow: ${route} @ ${width}`,
      );
      assert(
        await page.evaluate(
          () => !/[^\x00-\x7F]/.test(document.documentElement.textContent),
        ),
        `Non-ASCII text on ${route}`,
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.equal(
        results.violations.length,
        0,
        `${route} @ ${width}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      );
      if (
        ["/", "/books/mastery-hard-sudoku/"].includes(route) &&
        width !== 320
      ) {
        await page.evaluate(async () => {
          for (const img of document.images) {
            img.loading = "eager";
            await img.decode();
          }
        });
        await page.screenshot({
          path: `artifacts/${route === "/" ? "home" : "mastery"}-${width}.png`,
          fullPage: true,
        });
      }
    }
    console.log(
      `All ${files.length} pages passed layout and accessibility checks at ${width}px.`,
    );
  }
  // Reserve the same Discovery cover space even when its image is delayed.
  const delayed = await context.newPage();
  await delayed.setViewportSize({ width: 390, height: 900 });
  let releaseImage;
  const gate = new Promise((resolve) => {
    releaseImage = resolve;
  });
  await delayed.route("**/assets/advent-2026-*.webp", async (route) => {
    await gate;
    await route.continue();
  });
  await delayed.goto("http://127.0.0.1:4173/", {
    waitUntil: "domcontentloaded",
  });
  const tile = delayed.locator(".discovery-cover");
  await tile.scrollIntoViewIfNeeded();
  const before = await tile.boundingBox();
  assert(
    before.width > 250 && before.height > 300,
    "Unloaded Discovery cover collapsed",
  );
  releaseImage();
  await tile.locator("img").evaluate((img) => img.decode());
  const after = await tile.boundingBox();
  assert(
    Math.abs(before.height - after.height) < 1,
    "Discovery cover shifts when loaded",
  );
  assert(
    await delayed
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Reader resources" })
      .isVisible(),
  );
  await delayed.close();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4173/books/");
  const heights = await page
    .locator(".book-card .book-art")
    .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().height));
  assert(
    Math.max(...heights) - Math.min(...heights) < 1,
    "Cover card heights differ",
  );
  await page.goto("http://127.0.0.1:4173/books/");
  await page.getByRole("link", { name: "Practice!", exact: true }).click();
  assert(page.url().endsWith("/books/practice/"));
  assert.equal(await page.locator(".book-card").count(), 1);
  await page.goto("http://127.0.0.1:4173/books/");
  await page.getByRole("link", { name: "Discovery", exact: true }).click();
  assert(page.url().endsWith("/books/discovery/"));
  assert.equal(await page.locator(".book-card").count(), 1);
  await page
    .getByRole("heading", { name: "25 Days of Christmas Sudoku", exact: true })
    .getByRole("link")
    .click();
  assert(page.url().endsWith("/books/25-days-of-christmas-sudoku/"));
  const adventCover = page.locator(".detail-cover img");
  await adventCover.evaluate((img) => img.decode());
  assert.equal(await adventCover.getAttribute("width"), "1800");
  assert.equal(await adventCover.getAttribute("height"), "2250");
  assert((await adventCover.getAttribute("src")).includes("advent-2026"));
  await page.goto("http://127.0.0.1:4173/next/");
  await page.getByRole("link", { name: /creative surprise/ }).click();
  assert(page.url().endsWith("/books/25-days-of-christmas-sudoku/"));
  await page.goto("http://127.0.0.1:4173/next/");
  await page.getByRole("link", { name: /I get stuck/ }).click();
  assert(page.url().endsWith("/books/start-here-hard-sudoku-with-hints/"));
  await page.goto("http://127.0.0.1:4173/");
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "main");
  assert.deepEqual(errors, []);
  console.log(
    "Catalog filters, decision guide, keyboard skip link, and browser errors checked.",
  );
} finally {
  await browser?.close();
  server.kill();
}
