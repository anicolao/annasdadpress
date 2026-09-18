# TASK: Prepare annasdadpress.com for first-book launch

Review the current Anna’s Dad Press website and make a focused **launch-readiness pass**.

The site architecture, visual design, static-generation approach, and overall information structure are already good. Do **not** redesign the site or introduce new frameworks, CMSs, analytics, forms, ecommerce, or other major features.

The goal is to make the existing site behave correctly once books move from “Forthcoming” to “Available,” and to bring the copy/metadata into alignment with the actual books now nearing publication.

Repository:
`anicolao/annasdadpress`

## PRIORITY 1 — MAKE AVAILABILITY TRULY DATA-DRIVEN

This is the most important change.

The site currently has book-level `status`, Amazon URL, ISBN, and ASIN fields in `src/catalog.mjs`, but several rendered areas still hard-code wording such as:

- `Forthcoming`
- `Your next chapter is coming`
- catalog-wide `/ Forthcoming`
- generic “Coming to your bookshelf”

Refactor these so that book availability is driven by the catalog data.

Requirements:

- A book marked `Available` should display as available everywhere.
- A forthcoming book should still display as forthcoming.
- Do not hard-code all cards as `Forthcoming`.
- Do not hard-code the entire catalog as forthcoming.
- Available books should sort before forthcoming books where that improves clarity.
- Individual book pages should show purchase buttons when Amazon URLs exist.
- If a marketplace URL is absent, do not invent one.
- If a book is forthcoming, keep the existing restrained forthcoming treatment.
- Homepage sections should adapt naturally once at least one book is available.

The desired publishing workflow should become approximately:

1. update `status`
2. add ISBN/ASIN
3. add Amazon.ca / Amazon.com URLs
4. deploy

No additional template edits should be required just to make a newly published title appear live.

## PRIORITY 2 — ALIGN BOOK NAMES WITH CURRENT BRANDING

Review the website catalog against the current product naming.

Current intended branding is approximately:

- **The Sudoku Learner’s Guide**
- **Practice! X-Wing Sudoku**
- **START HERE! Hard Sudoku with Hints**
- **Candidates Done! Hard Sudoku**
- **Mastery! Advanced Sudoku**
- **25 Days of Christmas Sudoku**

The exact spelling/punctuation should match the final book covers and KDP metadata.

In particular:

- change `Practice: X-Wing Sudoku` to the current `Practice!` branding if that is the final cover title;
- change `Start Here:` to current `START HERE!` / `Start Here!` branding consistently;
- ensure `Candidates Done!` punctuation matches cover;
- update the Mastery title from `Hard Sudoku` to **Advanced Sudoku** if that is now the intended first Mastery title.

Do not change slugs unnecessarily if existing printed/stable URLs already depend on them.

Preserve URL stability.

## PRIORITY 3 — UPDATE THE LEARNER’S GUIDE PAGE FROM “DRAFT” LANGUAGE

The Guide is now nearing publication.

Review its page for outdated development language such as:

- “Planned as…”
- “approximately 250 pages”
- “Draft interior”
- “Layout and content may change before publication”

Replace these only where final information is actually known.

The page should reflect the current product more confidently.

Useful final facts to surface include, where verified from the manuscript:

- full-colour instructional book;
- roughly 250 pages;
- 45 complete puzzles;
- QR-linked interactive solving/walkthrough support;
- progression from beginner techniques through advanced patterns/chains;
- 6 × 9 inch format if appropriate to expose publicly.

Do not invent final specs that are not confirmed.

If the sample spread is still based on a draft PDF:
- either update it from the final/frozen manuscript,
- or keep a truthful disclaimer until the final sample is available.

Do not falsely label draft pages as final.

## PRIORITY 4 — ADD AUTHOR ATTRIBUTION

Make Alex Nicolaou clearly visible as the author.

Requirements:

- individual book pages should visibly show `by Alex Nicolaou`;
- Book JSON-LD should include an `author` Person object;
- preserve publisher attribution to Anna’s Dad Press;
- do not overemphasize author biography if the current design does not need it.

If practical, add an `author` field to catalog data rather than hard-coding it in templates.

## PRIORITY 5 — ADD A REAL CONTACT ROUTE

The site currently has no obvious way for readers to contact the publisher.

Add a simple contact path using a real monitored email address **only if one is already available in the repository/configuration or provided separately**.

Appropriate places:
- footer
- About page
- possibly Privacy page

Do not invent an email address.

Do not add:
- contact forms;
- accounts;
- CRM integrations;
- newsletter signup.

If no real publisher email is currently available, leave a clear TODO and report it rather than inventing one.

## PRIORITY 6 — IMPROVE AVAILABLE VS FORTHCOMING EMPHASIS

Once some titles are available, the site should not visually treat six books as equally current.

Requirements:

- available products should be more prominent;
- forthcoming books should remain visible but secondary;
- do not hide real near-complete books unnecessarily;
- consider hiding only very early-placeholder products if they are not yet useful to customers.

In particular, Mastery may still have a placeholder cover. If it remains only a concept, decide whether showing it adds useful catalog context or makes the site feel unfinished.

Prefer minimal changes.

## PRIORITY 7 — REORDER THE CORE SERIES PRESENTATION

The current family order starts with Discovery.

For the core Sudoku learning system, prefer this conceptual order:

1. Practice!
2. Start Here!
3. Candidates Done!
4. Mastery!

Discovery is intentionally different and seasonal/creative, so it should be:
- shown separately,
- or shown after the core learning families.

The homepage may still feature Discovery strongly during the Christmas sales season.

Do not break existing family URLs.

## PRIORITY 8 — MAKE THE HOMEPAGE SLIGHTLY MORE SALES-READY

Keep the current homepage visual identity and hero.

Do not redesign it.

Once the first books are live:
- ensure there is an obvious path from the homepage to an available book;
- consider changing a generic CTA such as `Explore our books` to a more direct book CTA when appropriate;
- consider an `Available now` treatment near the featured Guide cover;
- make the Advent title especially easy to reach during its seasonal buying period.

Keep the tone restrained and editorial, not aggressive ecommerce copy.

## THINGS NOT TO ADD

Do not add any of the following in this task:

- blog
- newsletter
- social feed
- testimonials
- ecommerce checkout
- account system
- CMS
- analytics vendor
- cookie banner
- SEO article farm
- popups
- stock photography

The current static, uncluttered site is a strength.

## EXISTING STRENGTHS TO PRESERVE

Keep:

- current visual identity;
- static generation;
- no-browser-JS approach unless truly necessary;
- responsive/mobile behavior;
- accessibility work;
- canonical URLs;
- Open Graph/Twitter metadata;
- sitemap and robots;
- structured data;
- `/next/` as a permanent reader-resource route;
- current privacy-first posture;
- existing stable book/family URLs;
- current cover-sync workflow.

## IMPLEMENTATION GUIDANCE

Before changing code:

1. inspect `src/catalog.mjs`;
2. inspect `scripts/build.mjs`;
3. inspect existing tests;
4. identify all places where availability, title, and forthcoming copy are hard-coded;
5. preserve the current data-driven architecture rather than adding ad hoc special cases.

Prefer small reusable helpers for:
- availability labels;
- purchase section rendering;
- book ordering;
- catalog summary wording.

Avoid one-off conditionals scattered across templates.

## TESTING

After changes:

- run the normal build;
- run the existing test suite;
- verify all internal links;
- verify available and forthcoming books render differently as intended;
- test a book with:
  - `status = Available`
  - Amazon.ca URL present
  - Amazon.com URL present
  - ISBN present
  - ASIN present
- test a forthcoming book with all purchase identifiers absent;
- verify `/next/` still works;
- verify mobile layouts;
- verify structured-data validity;
- verify no fake purchase links appear.

## DELIVERABLE

Report:

1. files changed;
2. the new book-publishing workflow;
3. any title/branding changes made;
4. any fields still awaiting real-world values;
5. whether a contact email remains unresolved;
6. any launch-blocking issues still present.

Do not modify unrelated parts of the site.