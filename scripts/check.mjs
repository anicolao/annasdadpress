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
  assert(!/[^\x00-\x7F]/.test(html), `Non-ASCII markup in ${file}`);
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  assert(!titles.has(title), `Duplicate title: ${title}`);
  titles.add(title);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
  assert(html.includes('rel="canonical"'));
  JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/)[1]);
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
      if (route === "/" && width !== 320) {
        await page.evaluate(async () => {
          for (const img of document.images) {
            img.loading = "eager";
            await img.decode();
          }
        });
        await page.screenshot({
          path: `artifacts/home-${width}.png`,
          fullPage: true,
        });
      }
    }
    console.log(
      `All ${files.length} pages passed layout and accessibility checks at ${width}px.`,
    );
  }
  await page.goto("http://127.0.0.1:4173/books/");
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  assert(page.url().endsWith("/books/practice/"));
  assert.equal(await page.locator(".book-card").count(), 1);
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
