import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import { buildSite } from "./build.mjs";
import { books, families } from "../src/catalog.mjs";
import { publisher } from "../src/publisher.mjs";
import {
  amazonLink,
  orderBooks,
  purchaseSection,
  validateCatalog,
  affiliateDisclosure,
} from "../src/publishing.mjs";

// Isolated test data: never written to the production catalog or dist.
const config = {
  ...publisher,
  contactEmail: "publisher@example.com",
  affiliateTags: { amazonCom: publisher.associateId, amazonCa: null },
};
const us =
  "https://www.amazon.com/dp/B000TEST00?ref_=test&tag=old&tag=duplicate#details";
const ca = "https://www.amazon.ca/dp/B000TEST00?ref_=test#details";
const tagged = new URL(amazonLink(us, "amazonCom", config).href);
assert.deepEqual(tagged.searchParams.getAll("tag"), [publisher.associateId]);
assert.equal(tagged.searchParams.get("ref_"), "test");
assert.equal(tagged.hash, "#details");
assert.equal(tagged.pathname, "/dp/B000TEST00");
assert.equal(amazonLink(ca, "amazonCa", config).href, ca);
assert.equal(amazonLink(null, "amazonCom", config), null);
for (const value of [
  "javascript:alert(1)",
  "https://amazon.com.evil.test/dp/x",
  "https://amazon.com@evil.test/dp/x",
  "https://www.amazon.ca/dp/x",
]) {
  assert.throws(() => amazonLink(value, "amazonCom", config));
}
assert.throws(() =>
  validateCatalog([{ ...books[0], status: "Unknown" }], config),
);
const noLinks = {
  ...books[0],
  status: "Available",
  amazonCa: null,
  amazonCom: null,
};
assert(!purchaseSection(noLinks, config).includes("Coming"));
assert(!purchaseSection(noLinks, config).includes("href="));
const oneLink = purchaseSection({ ...noLinks, amazonCa: ca }, config);
assert(oneLink.includes("Buy on Amazon.ca"));
assert(!oneLink.includes("Amazon.com") && !oneLink.includes("sponsored"));
const forthcomingLink = purchaseSection(
  { ...noLinks, status: "Forthcoming", amazonCom: us },
  config,
);
assert(forthcomingLink.includes("View on Amazon.com (paid link)"));
assert(forthcomingLink.includes(affiliateDisclosure));
assert(!forthcomingLink.includes("Buy on"));
const order = books.map((b) => b.slug);
orderBooks(books);
assert.deepEqual(
  books.map((b) => b.slug),
  order,
);
assert.deepEqual(
  families.map((f) => f.id),
  ["practice", "start-here", "candidates-done", "mastery", "discovery"],
);

const temp = await mkdtemp(path.join(tmpdir(), "press-launch-"));
const read = (directory, route) =>
  readFile(path.join(directory, route, "index.html"), "utf8");
const schemaOf = (html) =>
  JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/)[1]);
const cardTitles = (html) =>
  [...html.matchAll(/<h3><a class="" href="[^"]+">(.*?)<\/a><\/h3>/g)].map(
    (m) => m[1],
  );
let browser, server;
try {
  const allForthcoming = books.map((b) => ({
    ...b,
    status: "Forthcoming",
    isbn: null,
    asin: null,
    amazonCa: null,
    amazonCom: null,
  }));
  const mixed = allForthcoming.map((b) =>
    b.family === "practice"
      ? {
          ...b,
          status: "Available",
          isbn: "9780000000002",
          asin: "B000TEST00",
          amazonCa: ca,
          amazonCom: us,
        }
      : { ...b },
  );
  // Exercise single-market, missing-market, and forthcoming listing states in generated output too.
  mixed.find((b) => b.family === "candidates-done").status = "Available";
  mixed.find((b) => b.family === "candidates-done").amazonCa = ca;
  mixed.find((b) => b.family === "mastery").status = "Available";
  mixed.find((b) => b.family === "start-here").amazonCom = us;
  const allAvailable = mixed.map((b) => ({ ...b, status: "Available" }));
  for (const [name, data, summary] of [
    ["forthcoming", allForthcoming, "6 forthcoming"],
    ["mixed", mixed, "3 available / 3 forthcoming"],
    ["available", allAvailable, "6 available"],
  ]) {
    const directory = path.join(temp, name);
    await buildSite({
      books: data,
      outputDir: directory,
      publisher: config,
      basePath: "",
    });
    const catalog = await read(directory, "books");
    assert(catalog.includes(`6 titles / ${summary}`));
    assert.deepEqual(
      cardTitles(catalog),
      orderBooks(data).map((b) => b.title),
    );
    for (const b of data) {
      const html = await read(directory, `books/${b.slug}`);
      assert(html.includes(`<h1>${b.title}</h1>`));
      assert(html.includes("by Alex Nicolaou"));
      const schema = schemaOf(html);
      assert.deepEqual(schema.author, {
        "@type": "Person",
        name: "Alex Nicolaou",
      });
      assert.equal(schema.publisher.name, publisher.name);
      assert.equal(schema.isbn, b.isbn || undefined);
      assert.equal(schema.name, b.title);
      assert(!schema.offers);
      assert.equal(schema.url, `https://annasdadpress.com/books/${b.slug}/`);
      const purchase = html
        .split('<div class="purchase">')[1]
        .split("</section>")[0];
      assert.equal(
        purchase.includes("href="),
        Boolean(b.amazonCom || b.amazonCa),
      );
      assert.equal(
        purchase.includes("Coming to your bookshelf."),
        b.status === "Forthcoming",
      );
    }
    const home = await read(directory, "");
    assert(
      home.includes(
        'class="hero-book"><a class="" href="/books/the-sudoku-learners-guide/"',
      ),
    );
    assert.equal(
      home.includes("Available now / Print cover artwork"),
      name === "available",
    );
    assert.equal(
      home.includes("Your next chapter is coming."),
      name === "forthcoming",
    );
    assert(
      (await read(directory, "next")).includes(
        "https://sudoku.annasdadpress.com/",
      ),
    );
    assert(
      !(await read(directory, "next")).includes("The books are forthcoming"),
    );
    assert(
      (await read(directory, "about")).includes("mailto:publisher@example.com"),
    );
    assert(
      (await read(directory, "about")).includes(
        'href="https://www.amazon.com/stores/Learn-Math-with-Anna/author/B0H52Y3466"',
      ),
    );
    if (name === "mixed") {
      assert(
        home.includes(
          'href="/books/practice-x-wing-sudoku/">Explore an available book',
        ),
      );
      const practice = await read(directory, "books/practice-x-wing-sudoku");
      assert(practice.includes('rel="sponsored"'));
      assert(practice.includes(affiliateDisclosure));
      assert(practice.includes("B000TEST00"));
      const family = await read(directory, "books/practice");
      assert(family.includes("1 title / 1 available"));
    }
  }
  if (!process.env.STATIC_ONLY) {
    const { chromium } = await import("playwright");
    const { default: AxeBuilder } = await import("@axe-core/playwright");
    const root = path.join(temp, "mixed");
    server = http.createServer(async (req, res) => {
      try {
        const route = new URL(req.url, "http://localhost").pathname;
        const file = path.join(
          root,
          route.endsWith("/") ? route + "index.html" : route,
        );
        const content = await readFile(file);
        res.setHeader(
          "Content-Type",
          file.endsWith(".css")
            ? "text/css"
            : file.endsWith(".webp")
              ? "image/webp"
              : file.endsWith(".svg")
                ? "image/svg+xml"
                : "text/html",
        );
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await mkdir("artifacts", { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of [
        "/",
        "/books/",
        "/books/practice-x-wing-sudoku/",
        "/books/the-sudoku-learners-guide/",
        "/books/start-here-hard-sudoku-with-hints/",
      ]) {
        await page.goto(`http://127.0.0.1:${server.address().port}${route}`);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${route} overflow @ ${width}`,
        );
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          result.violations.map((v) => v.id),
          [],
          `${route} @ ${width}`,
        );
        if (width !== 320) {
          await page.locator("img").evaluateAll(async (images) => {
            for (const img of images) {
              img.loading = "eager";
              await img.decode();
            }
          });
          await page.screenshot({
            path: `artifacts/launch-${route.replaceAll("/", "_")}-${width}.png`,
            fullPage: true,
          });
        }
      }
    }
  }
  console.log(
    "Launch fixtures passed: publication states, ordering, purchases, affiliate URLs, author metadata, stable routes, and contact rendering.",
  );
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
