import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { mkdir, rm, cp, writeFile, readFile } from "node:fs/promises";
import sharp from "sharp";
import { icon, publisherMark, publisherPaths } from "../src/icons.mjs";
import { books as catalogBooks, families } from "../src/catalog.mjs";
import { publisher as publisherConfig } from "../src/publisher.mjs";
import {
  available,
  availabilityLabel,
  orderBooks,
  recommendations,
  catalogSummary,
  validateCatalog,
  purchaseSection,
  escapeHtml,
  amazonLink,
  marketplaces,
  affiliateDisclosure,
} from "../src/publishing.mjs";
import { fileURLToPath } from "node:url";

export async function buildSite({
  books = catalogBooks,
  outputDir = "dist",
  publisher = publisherConfig,
  basePath = process.env.BASE_PATH || "",
} = {}) {
  validateCatalog(books, publisher);
  const guideBook = books.find((b) => b.slug === "the-sudoku-learners-guide");
  const firstAvailable = orderBooks(books).find(available);
  const hasAffiliateLinks = books.some((b) =>
    marketplaces.some((m) => amazonLink(b[m.key], m.key, publisher)?.affiliate),
  );
  const contact = publisher.contactEmail
    ? `<a href="mailto:${escapeHtml(publisher.contactEmail)}">${escapeHtml(publisher.contactEmail)}</a>`
    : "";

  const origin = "https://annasdadpress.com";
  const base = basePath.replace(/\/$/, "");
  const url = (p) => (/^https?:\/\//.test(p) ? p : base + p);
  const esc = escapeHtml;
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(`${outputDir}/assets`, { recursive: true });
  await cp("public", outputDir, { recursive: true });
  for (const b of books.filter((b) => b.cover)) {
    if (b.coverManifest) {
      const record = JSON.parse(await readFile(b.coverManifest, "utf8"));
      const image = await readFile(b.coverSource);
      const metadata = await sharp(image).metadata();
      assert.equal(record.schema, 1);
      assert.equal(record.artworkStatus, "print");
      assert.equal(
        createHash("sha256").update(image).digest("hex"),
        record.sha256,
        "Cover integrity check failed; run covers:sync",
      );
      assert.equal(metadata.width, record.width);
      assert.equal(metadata.height, record.height);
      assert.equal(b.coverWidth, record.width);
      assert.equal(b.coverHeight, record.height);
    }
    for (const w of [360, 720, 1440])
      await sharp(b.coverSource)
        .resize(w)
        .webp({ quality: 85 })
        .toFile(`${outputDir}/assets/${b.cover}-${w}.webp`);
  }
  const mark = publisherMark("brand-mark");
  const link = (p, t, c = "") => `<a class="${c}" href="${url(p)}">${t}</a>`;
  const arrow = icon("diagonal");
  function cover(b, hero = false) {
    return b.cover
      ? `<img src="${url(`/assets/${b.cover}-720.webp`)}" srcset="${url(`/assets/${b.cover}-360.webp`)} 360w, ${url(`/assets/${b.cover}-720.webp`)} 720w, ${url(`/assets/${b.cover}-1440.webp`)} 1440w" sizes="${hero ? "(max-width: 650px) 65vw, 330px" : "(max-width: 650px) 75vw, 280px"}" width="${b.coverWidth}" height="${b.coverHeight}" alt="${esc(b.title)}: ${esc(b.coverStatus)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}>`
      : `<div class="cover-placeholder"><span>THE SUDOKU<br>LEARNER'S LIBRARY</span><strong>MASTERY</strong><b>${esc(b.placeholderTitle || b.title)}</b>${icon("mastery", "placeholder-grid")}<small>COVER FORTHCOMING</small></div>`;
  }
  function card(b) {
    const f = families.find((f) => f.id === b.family);
    return `<article class="book-card"><a class="book-art ${b.family}" href="${url("/books/" + b.slug + "/")}">${cover(b)}</a><div class="book-info"><span class="eyebrow" style="color:${f?.color || "#066568"}">${f?.name || "The complete course"}</span><h3>${link("/books/" + b.slug + "/", b.title)}</h3><p>${b.description}</p><span class="status ${available(b) ? "available" : ""}">${availabilityLabel(b)}</span></div></article>`;
  }
  function interiors(b) {
    if (!b.sampleSpreads.length)
      return `<section class="interior section"><p class="eyebrow">A look inside</p><h2>Sample pages are on their way.</h2><p>Interior spreads will be shared here when they're ready.</p></section>`;
    return `<section class="interior interior-preview section" id="sample-pages"><p class="eyebrow">A look inside the guide</p>${b.sampleSpreads.map((spread) => `<h2>${esc(spread.title)}</h2><p class="spread-intro">${esc(spread.description)}</p><figure class="sample-spread"><div class="spread-pages">${spread.pages.map((p) => `<a class="sample-page" href="${url("/assets/samples/" + p.image + "-1280.webp")}" aria-label="${esc(p.label)}: view full-size image"><img src="${url("/assets/samples/" + p.image + "-640.webp")}" srcset="${url("/assets/samples/" + p.image + "-640.webp")} 640w, ${url("/assets/samples/" + p.image + "-1280.webp")} 1280w" sizes="(max-width: 650px) calc(100vw - 80px), (max-width: 1050px) 40vw, 520px" width="640" height="960" loading="lazy" alt="${esc(p.alt)}"><span>${esc(p.label)} ${arrow}</span></a>`).join("")}</div><figcaption>${esc(spread.caption)}</figcaption></figure><div class="spread-actions">${link(spread.pdf, "Read the two-page sample (PDF) " + arrow, "button")}<span>Choose a page to view it full size.</span></div><details class="sample-explanation"><summary>Read the example in text</summary>${spread.explanation.map((p) => `<p>${esc(p)}</p>`).join("")}</details>`).join("")}</section>`;
  }
  function familyGrid() {
    return `<div class="family-grid">${families.map((f, i) => `<a class="family-card ${f.id}" style="--accent:${f.color}" href="${url("/books/" + f.id + "/")}"><div class="family-top">${icon(f.icon, "family-icon")}<span class="index">0${i + 1}</span></div><h3>${f.name}</h3><h4>${f.purpose}</h4><p>${f.description}</p><span class="text-link">Explore the series ${arrow}</span></a>`).join("")}</div>`;
  }
  function discoveryFeature() {
    const b = books.find((b) => b.family === "discovery");
    return `<section class="discovery-feature section wrap"><div class="discovery-copy"><p class="eyebrow">Introducing Discovery / December 2026</p><h2>A little discovery.<br><em>Every December day.</em></h2><p>Our new Discovery series begins with <strong>25 Days of Christmas Sudoku</strong>: an Advent calendar in puzzle-book form.</p><p>Solve a daily Sudoku, follow the drawing clues, and uncover another part of one festive scene. A quiet moment with a pencil, from December 1 to Christmas Day.</p><div class="feature-tags"><span>25 moderate puzzles</span><span>Daily drawing reveals</span><span>8 x 10 inch paperback</span></div><div class="actions">${link("/books/" + b.slug + "/", "Explore the Advent book " + arrow, "button")}${link("/books/discovery/", "Meet Discovery " + arrow, "text-link")}</div><p class="small-note">${availabilityLabel(b)} / First in the Discovery series</p></div><a class="discovery-cover" href="${url("/books/" + b.slug + "/")}">${cover(b)}</a></section>`;
  }
  function choose() {
    return `<section class="section chooser" id="choose"><div class="section-heading"><div><p class="eyebrow">Find your next step</p><h2>Which book is right for you?</h2></div><p>Start where you are.<br>There's more than one way in.</p></div><div class="choices">${[{ need: "I want to learn how Sudoku works.", name: "The Learner's Guide", slug: guideBook.slug }, ...families.map((f) => ({ ...f, slug: books.find((b) => b.family === f.id).slug }))].map((f) => link("/books/" + f.slug + "/", `<span>${f.need}</span><strong>${f.name} ${arrow}</strong>`, "choice")).join("")}</div></section>`;
  }
  const pages = [];
  async function page(path, title, description, body, schema) {
    pages.push(path);
    const canonical = origin + path;
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Anna's Dad Press",
      url: origin,
      description:
        "An independent Canadian publisher of educational and puzzle books.",
    };
    const html = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Anna's Dad Press</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="${schema ? "book" : "website"}"><meta property="og:site_name" content="Anna's Dad Press"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${schema?.image || origin + "/assets/social.png"}"><meta property="og:image:alt" content="${esc(schema?.name || "Anna's Dad Press: Books for curious minds")}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f7f6f0"><link rel="icon" href="${url("/assets/favicon.svg")}" type="image/svg+xml"><link rel="stylesheet" href="${url("/assets/style.css")}"><script type="application/ld+json">${JSON.stringify(schema || organization).replaceAll("<", "\\u003c")}</script></head><body><a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap header-inner">${link("/", `${mark}<span class="brand-name">Anna's Dad<span>PRESS</span></span>`, "brand")}<nav aria-label="Main navigation">${[
      ["/books/", "Our books"],
      ["/sudoku-learners-library/", "The Sudoku Library"],
      ["/about/", "Our story"],
    ]
      .map(
        ([p, t]) =>
          `<a href="${url(p)}" ${path.startsWith(p) ? 'aria-current="page"' : ""}>${t}</a>`,
      )
      .join(
        "",
      )}${link("/next/", "Find your next book " + arrow, "nav-cta")}</nav></div></header><main id="main" tabindex="-1">${body}</main><footer><div class="wrap footer-main"><div>${link("/", `${mark}<span class="brand-name">Anna's Dad<span>PRESS</span></span>`, "brand")}<p>Thoughtfully made books.<br>A little more understanding, one page at a time.</p></div><div class="footer-links">${link("/books/", "Our books")}${link("/about/", "Our story")}${link("/next/", "Reader resources")}${link("/privacy/", "Privacy")}${contact}</div></div>${hasAffiliateLinks ? `<p class="wrap affiliate-disclosure">${affiliateDisclosure}</p>` : ""}<div class="wrap footer-bottom"><span>Copyright ${new Date().getFullYear()} Anna's Dad Press</span><span>Independent publishing / Canada</span></div></footer></body></html>`;
    const file =
      path === "/404.html"
        ? `${outputDir}/404.html`
        : `${outputDir}${path}index.html`;
    await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
    await writeFile(file, html);
  }
  await page(
    "/",
    "Books for curious minds",
    "Thoughtfully designed educational and puzzle books from an independent Canadian publisher. Discover The Sudoku Learner's Library.",
    `<section class="hero wrap"><div class="hero-copy"><p class="eyebrow"><span class="tiny-line"></span> Independent minds. Thoughtful books.</p><h1>A little curiosity.<br>A new perspective.<br><em>Your next step.</em></h1><p class="hero-description">Books that make the unfamiliar understandable.<br>Carefully designed to help you learn, practise,<br class="desktop"> and discover what you can do.</p><div class="actions">${link(firstAvailable ? "/books/" + firstAvailable.slug + "/" : "/books/", (firstAvailable ? "Explore an available book " : "Explore our books ") + arrow, "button")}${link("/about/", `Meet Anna's Dad ${icon("arrow")}`, "text-link")}</div><p class="hero-note">${icon("ornament")} Made for curious minds. At every stage.</p></div><div class="hero-art"><div class="art-grid" aria-hidden="true"></div><span class="art-caption">A NEW CHAPTER IN LEARNING</span><div class="hero-book">${link("/books/" + guideBook.slug + "/", cover(guideBook, true))}</div><div class="edition-note">${icon("ornament", "edition-ornament")}<span>Introducing<br><strong>The Sudoku<br>Learner's Library</strong></span></div><span class="concept-note">${available(guideBook) ? "Available now / " : ""}${guideBook.coverStatus}</span></div></section><div class="values-strip"><div class="wrap"><span>Clear explanations</span>${icon("ornament")}<span>Purposeful practice</span>${icon("ornament")}<span>Real understanding</span>${icon("ornament")}<span>The pleasure of progress</span></div></div><section class="section wrap"><div class="section-heading"><div><p class="eyebrow">Our first collection</p><h2>Don't just fill the grid.<br><em>See the possibilities.</em></h2></div><div><p>The Sudoku Learner's Library brings together clear<br class="desktop"> teaching and purposeful practice. A collection that<br class="desktop"> grows with you, from your first grid to your next challenge.</p>${link("/sudoku-learners-library/", "Discover the library " + arrow, "text-link")}</div></div><div class="feature"><div class="feature-label"><span class="eyebrow">Start with understanding</span><h3>One guide.<br> A world of<br> <em>\"now I see it.\"</em></h3></div><div><h3>The Sudoku Learner's Guide</h3><p>A full-colour, step-by-step course that takes you from the very first rule to advanced solving techniques. Learn the logic, see it in action, and make it your own.</p><div class="feature-tags"><span>Visual explanations</span><span>Complete walkthroughs</span><span>Beginner to advanced</span></div>${link("/books/" + guideBook.slug + "/", "Inside the guide " + arrow, "text-link")}</div>${icon("diagonal", "feature-symbol")}</div><div class="subheading"><h3>More ways to enjoy the next puzzle.</h3><span>Different support. The same thoughtful approach.</span></div>${familyGrid()}</section>${discoveryFeature()}<section class="latest"><div class="wrap section"><div class="section-heading"><div><p class="eyebrow">${firstAvailable ? "Available now" : "On the publishing desk"}</p><h2>${firstAvailable ? "Find your next chapter." : "Your next chapter is coming."}</h2></div>${link("/books/", "View all books " + arrow, "text-link")}</div><div class="book-grid">${recommendations(books).slice(0, 3).map(card).join("")}</div></div></section><section class="story-section wrap section"><div class="story-monogram" aria-hidden="true">${publisherMark()}</div><div><p class="eyebrow">A daughter's idea. A dad's next chapter.</p><h2>It started with Anna.</h2><p>When Anna built her successful <a class="inline-link" href="https://www.learnmathwithanna.com/"><em>Learn Math with Anna</em></a> publishing project, her dad was paying attention. Watching her create useful educational books inspired him to start making his own.</p><p>That's the story behind the name. And the spirit behind every book.</p>${link("/about/", "Our story " + arrow, "text-link")}</div></section>`,
  );
  const intro = (eyebrow, title, description) =>
    `<section class="page-intro wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></section>`;
  async function catalog(path, selected) {
    const f = families.find((f) => f.id === selected);
    const selectedBooks = orderBooks(
      books.filter((b) => !f || b.family === selected),
    );
    await page(
      path,
      f
        ? f.name + " Sudoku books"
        : selected === "library"
          ? "Sudoku book catalog"
          : "Our books",
      f?.description ||
        "Explore educational and puzzle books from Anna's Dad Press.",
      `${intro(f?.id === "discovery" ? "The Discovery series / First book: December 2026" : "The catalog", f ? f.name : "Good books. New possibilities.", f?.description || `Explore The Sudoku Learner's Library. ${books.length} titles, each with a different way to help you move forward.`)}<section class="wrap catalog-section"><nav class="filters" aria-label="Filter books">${[["all", "All books", "/books/"], ["library", "Sudoku Learner's Library", "/books/sudoku/"], ...families.map((f) => [f.id, f.name, "/books/" + f.id + "/"])].map(([id, name, p]) => `<a href="${url(p)}" ${selected === id ? 'aria-current="page"' : ""}>${name}</a>`).join("")}</nav><p class="catalog-note">${f ? "Part of The Sudoku Learner's Library" : "The Sudoku Learner's Library"} / ${selectedBooks.length} ${selectedBooks.length === 1 ? "title" : "titles"} / ${catalogSummary(selectedBooks)}</p><div class="book-grid">${selectedBooks
        .map(card)
        .join(
          "",
        )}</div><p class="small-note">Cover artwork status is noted on each book's page. Publication details will be added as they become available.</p></section>`,
    );
  }
  await catalog("/books/", "all");
  await catalog("/books/sudoku/", "library");
  for (const f of families) await catalog("/books/" + f.id + "/", f.id);
  await page(
    "/sudoku-learners-library/",
    "The Sudoku Learner's Library",
    "Learn, practise, get guidance, and solve independently. Find your way through our complementary Sudoku book families.",
    `${intro("A collection built around learning", "The Sudoku<br><em>Learner's Library.</em>", "A good puzzle asks you to think. A good learning book helps you understand how. Find the right balance of explanation, practice, and independence.")}<section class="wrap section top-zero"><div class="progression">${[
      ["01", "Learn", "Build your foundation with the Guide."],
      ["02", "Practice", "Get to know a technique through focused drills."],
      ["03", "Get guidance", "Use hints or supplied candidates for support."],
      ["04", "Solve independently", "Bring it all together with Mastery."],
    ]
      .map(
        ([n, t, d]) =>
          `<div><span class="eyebrow">${n} ${icon("arrow")}</span><h3>${t}</h3><p>${d}</p></div>`,
      )
      .join(
        "",
      )}</div><div class="section-heading"><div><p class="eyebrow">Different books. Different jobs.</p><h2>A library, not a ladder.</h2></div><p>Use the Guide as your reference. Choose Practice for a specific<br class="desktop"> technique, Start Here for a hint, or Candidates Done to skip<br class="desktop"> setup. Mastery gives you room to solve on your own. Discovery adds a creative reward: puzzles that reveal a picture.</p></div>${familyGrid()}${choose()}</section>`,
  );
  for (const b of books) {
    const f = families.find((f) => f.id === b.family);
    const guide = b.family === "guide";
    const schema = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: b.title,
      ...(b.subtitle ? { alternativeHeadline: b.subtitle } : {}),
      description: b.description,
      url: origin + "/books/" + b.slug + "/",
      inLanguage: "en",
      author: { "@type": "Person", name: b.author },
      isPartOf: { "@type": "CreativeWorkSeries", name: b.collection },
      publisher: {
        "@type": "Organization",
        name: "Anna's Dad Press",
        url: origin,
      },
      ...(b.isbn ? { isbn: b.isbn } : {}),
      ...(b.cover
        ? { image: origin + "/assets/" + b.cover + "-720.webp" }
        : {}),
    };
    await page(
      "/books/" + b.slug + "/",
      b.title,
      b.description,
      `<div class="wrap"><div class="breadcrumbs">${link("/books/", "Our books")} <span>/</span> ${f ? link("/books/" + f.id + "/", f.name) : "The complete course"}</div><section class="book-detail"><div class="detail-cover"><div class="book-art ${b.family}">${cover(b, true)}</div><p class="small-note">${b.coverStatus}</p></div><div><p class="eyebrow">${b.collection}</p><span class="status ${available(b) ? "available" : ""}">${availabilityLabel(b)}</span><h1>${esc(b.title)}</h1><p class="byline">by ${esc(b.author)}</p>${b.subtitle ? `<p class="subtitle">${b.subtitle}</p>` : ""}<p>${b.description}</p><div class="best-for"><span class="eyebrow">A good fit for</span><p>${b.bestFor}</p></div>${purchaseSection(b, publisher)}</div></section>${guide ? `<section class="section teaching"><p class="eyebrow">Understanding, step by step</p><h2>Learn it. See it. Make it yours.</h2><div class="teaching-steps">${["Learn", "See", "Walkthrough", "Practice", "Solve"].map((t, i) => `<div><span>0${i + 1}</span><h3>${t}</h3></div>`).join("")}</div><div class="two-col"><div><h3>A complete visual course</h3><p>${esc(b.courseDescription)}</p><p>The book's QR codes open the exact puzzle in our ${link("https://sudoku.annasdadpress.com/", "online Sudoku solver")}. Enter digits and candidate notes, ask for a hint, or follow a walkthrough. Find the solver any time at ${link("/next/", "annasdadpress.com/next")}.</p></div><div><h3>From the first rule to advanced logic</h3><p>Full Houses; Naked and Hidden Singles; Naked and Hidden Pairs; Pointing Pairs; Y-Wing; X-Wing; Swordfish; Naked Triples; Simple Colors; XY-Chains; Unique Rectangles; and 3D Medusa.</p></div></div></section>` : ""}${b.features ? `<section class="section"><p class="eyebrow">${esc(b.featureIntro)}</p><h2>${esc(b.featureHeading)}</h2><div class="progression">${b.features.map((step, i) => `<div><span class="eyebrow">0${i + 1}</span><h3>${esc(step.title)}</h3><p>${esc(step.description)}</p></div>`).join("")}</div><p>${esc(b.featureNote)}</p>${link("/books/" + f.id + "/", "Explore the " + f.name + " series " + arrow, "text-link")}</section>` : ""}${interiors(b)}<section class="section"><div class="section-heading"><h2>More ways to learn.</h2>${link("/sudoku-learners-library/", "Explore the library " + arrow, "text-link")}</div><div class="book-grid">${recommendations(
        books.filter((x) => x.slug !== b.slug),
      )
        .slice(0, 3)
        .map(card)
        .join("")}</div></section></div>`,
      schema,
    );
  }
  await page(
    "/about/",
    "Our story",
    "Anna's successful Learn Math With Anna project inspired her dad to begin publishing. Meet the idea behind Anna's Dad Press.",
    `${intro("About Anna's Dad Press", "The inspiration<br><em>was close to home.</em>", "An independent Canadian publisher, making educational and puzzle books for curious minds.")}<section class="wrap story-body section top-zero"><div class="story-monogram" aria-hidden="true">${publisherMark()}</div><div><h2>First Anna. Then her dad.</h2><p>Anna created <a class="inline-link" href="https://www.learnmathwithanna.com/"><em>Learn Math with Anna</em></a>, a successful self-publishing project focused on educational books. Her dad watched her build something useful and saw what thoughtful publishing could do.</p><p>That experience inspired him to begin publishing his own line of books. The name Anna's Dad Press is a small acknowledgement of where the idea began.</p>${contact ? `<p>Contact Anna's Dad Press: ${contact}</p>` : ""}<div class="anna-links">${link("https://www.learnmathwithanna.com/", "Visit Anna's website " + arrow, "text-link")}${link("https://www.amazon.com/stores/Learn-Math-with-Anna/author/B0H52Y3466", "Anna's books on Amazon " + arrow, "text-link")}</div><p>The first collection is <em>The Sudoku Learner's Library</em>: instruction and practice books that help readers understand the logic, recognise the patterns, and grow into more confident solvers.</p></div></section><section class="latest"><div class="wrap section"><p class="eyebrow">Our publishing philosophy</p><h2>Make the difficult approachable.</h2><div class="progression">${[
      ["Teach clearly", "Explain the reasoning, not just the answer."],
      [
        "Make it visible",
        "Use visual explanations where they help an idea click.",
      ],
      [
        "Practise with purpose",
        "Give readers deliberate opportunities to use what they learn.",
      ],
      [
        "Respect the reader",
        "Make challenging material approachable without oversimplifying it.",
      ],
    ]
      .map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`)
      .join(
        "",
      )}</div>${link("/books/", "Meet the books " + arrow, "button")}</div></section>`,
  );
  await page(
    "/next/",
    "Your next step",
    "Find the right Sudoku book and check the availability of companion resources from Anna's Dad Press.",
    `${intro("For our readers", "Your next step<br><em>starts here.</em>", "Looking for a book, a little guidance, or a resource mentioned on the page? You're in the right place.")}<div class="wrap"><aside class="resource-note"><h2>Companion resources</h2><p>The online Sudoku solver is ready to use. Scan a QR code in the guide to open that exact puzzle, or open the solver to start playing. More companion resources will be added here as they're released.</p><div class="actions">${link("https://sudoku.annasdadpress.com/", "Open the Sudoku solver " + arrow, "button")}</div></aside>${choose()}</div>`,
  );
  await page(
    "/privacy/",
    "Privacy",
    "How this simple publisher website handles visitor information.",
    `${intro("The small print", "Privacy, plainly.", "This website is a catalog for Anna's Dad Press.")}<section class="wrap prose section top-zero"><h2>What this site collects</h2><p>We do not run analytics, use advertising trackers, set cookies, offer accounts, or collect information through forms on this website.</p><h2>Website hosting</h2><p>The site is hosted by GitHub Pages. Hosting and network providers may process technical information, including IP addresses and request logs, to deliver and protect the website. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub's privacy statement</a> for details. When traffic passes through Cloudflare, its <a href="https://www.cloudflare.com/privacypolicy/">privacy policy</a> also applies.</p><h2>Book purchases</h2><p>Book purchase links take you to Amazon. Links marked "paid link" include an affiliate tracking ID, which lets Amazon attribute qualifying purchases to this publisher. This site does not run tracking scripts or set cookies. Any information you provide there is handled by Amazon under its own privacy policy. We do not process payments on this website.</p><h2>Changes</h2><p>We will update this page if the website's use of information changes.</p><p class="small-note">Last updated: September 18, 2026.</p></section>`,
  );
  await page(
    "/404.html",
    "Page not found",
    "Find your way back to Anna's Dad Press.",
    `${intro("404 / A small detour", "Let's find your next page.", "That page isn't in our library. Browse the books or head back home.")}<div class="wrap section top-zero">${link("/", `Back home ${icon("arrow")}`, "button")} ${link("/books/", "Browse our books", "text-link")}</div>`,
  );
  await writeFile(
    `${outputDir}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
      .filter((p) => p != "/404.html")
      .map((p) => `<url><loc>${origin + p}</loc></url>`)
      .join("")}</urlset>`,
  );
  await writeFile(
    `${outputDir}/robots.txt`,
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(`${outputDir}/.nojekyll`, "");
  await writeFile(
    `${outputDir}/assets/favicon.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="3" fill="#066568"/><g transform="translate(5 3) scale(.84)" fill="none" stroke="#f7f6f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${publisherPaths}</g></svg>`,
  );
  if (!base) await writeFile(`${outputDir}/CNAME`, "annasdadpress.com\n");
  await sharp(
    Buffer.from(
      `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#f7f6f0"/><rect x="65" y="65" width="90" height="90" fill="#066568"/><g transform="translate(73 69) scale(1.16)" fill="none" stroke="#f7f6f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${publisherPaths}</g><text x="185" y="128" font-family="Georgia" font-size="46" fill="#142e3c">Anna's Dad Press</text><text x="65" y="300" font-family="Georgia" font-size="76" fill="#142e3c">A little curiosity.</text><text x="65" y="395" font-family="Georgia" font-size="76" fill="#142e3c">A new perspective.</text><text x="65" y="490" font-family="Georgia" font-size="76" font-style="italic" fill="#066568">Your next step.</text><text x="65" y="580" font-family="sans-serif" font-size="20" fill="#142e3c">INDEPENDENT PUBLISHING / CANADA</text></svg>`,
    ),
  )
    .png()
    .toFile(`${outputDir}/assets/social.png`);
  console.log(`Built ${pages.length} pages.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await buildSite();
