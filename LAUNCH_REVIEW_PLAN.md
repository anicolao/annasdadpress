# Launch readiness implementation plan

Based on [LAUNCH_REVIEW.md](LAUNCH_REVIEW.md) and inspection of the current catalog,
site generator, sample extractor, tests, README, and deployment workflow.
This document plans the work; it does not change publication status or deploy it.

## Scope and constraints

Keep the current design, static generation, responsive layouts, accessibility,
ASCII website text, SVG artwork, and no-browser-JavaScript approach. Preserve all
book and family slugs, `/next/`, solver links, canonical URLs, social metadata,
sitemap, robots, privacy posture, and cover-sync workflow.

Do not introduce frameworks, a CMS, analytics, forms, accounts, checkout, blogs,
newsletters, feeds, testimonials, popups, or stock photography. Make only the
content and rendering changes needed for launch.

## Current findings

- `src/catalog.mjs` contains six books. All currently default to `Forthcoming`,
  with null ISBN, ASIN, and Amazon URLs. There is no catalog author field.
- `scripts/build.mjs` hard-codes availability in `card()`, `catalog()`,
  `discoveryFeature()`, the homepage publishing section, individual purchase
  headings/explanations, and `/next/` companion-resource copy.
- Purchase links already render when URLs exist, but surrounding copy still says
  the book is coming. Missing URLs always receive a "Coming soon" label.
- Homepage and related-book selection use array position and `slice()`. The Guide
  hero and chooser reference `books[0]`; sorting that array in place would select
  the wrong book.
- Discovery currently precedes the four core families. Mastery has a placeholder
  cover whose HTML independently hard-codes "Hard Sudoku".
- The Guide has planned-product wording and draft sample captions/alt text.
  `scripts/extract-samples.py` also hard-codes draft PDF metadata and page numbers.
- Existing tests cover 19 pages, links, parseable JSON-LD, ASCII text, accessibility,
  three viewport widths, catalog navigation, and the chooser. They do not exercise
  mixed publication states or assert Book author metadata.
- No monitored contact address was found in the inspected public source or README.
  A private configuration check remains an implementation step; a hosting account
  email is not automatically a public publisher contact address.

## 1. Confirm product facts and record unresolved inputs

Before changing product claims, compare each catalog entry with the current cover,
publication metadata, and any supplied final KDP listing details. Use the local
MathPub workspace as evidence, following its guidance when inspecting it. Do not
modify or rebuild manuscripts merely to update this website.

| Product | Required check |
| --- | --- |
| Learner's Guide | Final title/subtitle, colour format, trim, puzzle count, page-count convention, and frozen sample source |
| Practice | Confirm `Practice! X-Wing Sudoku` and final subtitle |
| Start Here | Resolve intended `START HERE!`/`Start Here!` punctuation and `with Hints` versus the current cover's `with Visual Hints` |
| Candidates Done | Confirm whether the intended exclamation mark is part of the final title; current imported artwork does not establish it |
| Mastery | Confirm `Mastery! Advanced Sudoku`, description, and readiness before changing the existing Hard Sudoku entry |
| Advent | Confirm current title/subtitle and December 2026 edition details |

Treat the review's proposed branding as direction to verify, not permission to
claim unconfirmed KDP metadata. Record discrepancies for the publisher to resolve.
Keep existing slugs even when display titles change, including `mastery-hard-sudoku`.

Required release inputs are the identity of the first available book, its actual
availability, and real marketplace URLs. ISBN/ASIN remain absent until supplied;
never derive purchase links from guessed identifiers. Other work can proceed while
these facts are pending.

## 2. Make availability data-driven (highest priority)

Keep `status`, `amazonCa`, `amazonCom`, `isbn`, and `asin` in the catalog. Validate
supported statuses (`Available` and `Forthcoming`) and supplied link values. Keep
artwork status independent of publication status.

Add small reusable helpers, in a focused module if useful, for availability labels,
purchase rendering, stable book ordering, and catalog summary wording. Apply them
to every surface identified above, including page descriptions and related books.

| Catalog state | Required rendering |
| --- | --- |
| Available, both URLs present | Available label, purchase heading, both real marketplace buttons, supplied identifiers |
| Available, one URL present | Available label and that marketplace button; no invented second link or blanket "Coming soon" claim |
| Available, no URLs | Truthful available label with neutral purchase-link-pending text; flag missing launch data |
| Forthcoming, no URLs | Existing restrained forthcoming treatment and no purchase links |
| Forthcoming, supplied URL | Retain forthcoming status; render only the supplied listing link with neutral wording, without assuming preorder support |

Compute catalog counts/status summaries from the filtered books, covering all
forthcoming, mixed, and all available states. Available books sort first in
catalogs, homepage book selections, and related recommendations, preserving
editorial order within each group. Do not mutate the source array. Resolve the
Guide by stable slug before introducing sorting.

Acceptance: making a book available and supplying its identifiers/URLs requires
only catalog edits, with no contradictory forthcoming copy elsewhere.

### Amazon Associates links

The publisher supplied Associate ID is `annasdadpress-20`.

- Store this ID once in shared publisher/link configuration. Keep real product
  destinations in the catalog; a tracking ID does not supply a missing book URL.
- Use a shared Amazon-link helper to apply the configured `tag` parameter to
  eligible purchase links. Preserve the product destination, other query
  parameters, and fragments; avoid duplicate tags and conflicting old tags.
- Before enabling tagging for each marketplace, verify which Amazon Associates
  account/marketplace this ID belongs to and whether Amazon.ca needs a separate
  tracking ID or configured cross-marketplace linking. Do not assume the supplied
  ID works for both Amazon.com and Amazon.ca. Keep valid untagged links where
  affiliate setup is not confirmed.
- Review Amazon's current official Associates linking and disclosure guidance at
  implementation time. Add the required publisher disclosure and clear affiliate
  identification near purchase links; keep the presentation restrained and
  accessible. Mark affiliate links with `rel="sponsored"`.
- Check the Privacy page's description of external Amazon links for accuracy.
  Affiliate links do not require adding site analytics, scripts, or cookies.
- Scope this to the publisher's book purchase links. Leave Anna's separate store
  link and other external resources unchanged unless separately requested.

## 3. Align titles and author attribution

Update verified book and family display names in the catalog, then remove duplicate
hard-coded names from templates where they could drift. Review visible headings,
breadcrumbs, chooser labels, cover alt text, placeholders, HTML titles, social
metadata, Book JSON-LD, and matching test selectors.

Add catalog author data for Alex Nicolaou. Render `by Alex Nicolaou` on each book
page and `author: { "@type": "Person", "name": "Alex Nicolaou" }` in Book
JSON-LD. Retain Anna's Dad Press as publisher. Do not invent author profile URLs,
prices, publication dates, or structured offers.

If Mastery's title changes, update its description, best-for copy, and placeholder
text together. Preserve its existing page and family URLs.

## 4. Bring the Guide copy and sample up to date

Verify full-colour format, 6 x 9 inch trim, 45 complete puzzles, technique coverage,
and QR-linked solving/walkthrough support from the appropriate manuscript edition.
Replace "Planned as" with factual copy only where supported. Distinguish physical
PDF pages, printed pagination, and KDP page count before publishing an exact count;
use a truthful approximate count or omit it if final pagination is unresolved.

For the sample, either:

- Locate the corresponding X-Wing spread in the frozen manuscript, verify its
  content and printed page numbers, and regenerate the two-page PDF and responsive
  images; update captions, alt text, explanation, and PDF metadata together; or
- Retain the existing excerpt and its explicit draft disclaimer until a final
  sample can be verified.

Do not merely remove "draft" from existing assets. Preserve public sample URLs
where practical, and never copy the full manuscript into public assets.

## 5. Reorder series and improve launch emphasis

Present the core families as Practice!, Start Here!, Candidates Done!, and Mastery!,
with exact punctuation subject to step 1. Put Discovery after them in family grids,
filters, and the chooser. Keep its existing seasonal homepage feature and URLs.

Preserve the hero design and Guide cover. When any book is available, provide an
obvious homepage link to an available title or the available selection. Show an
"Available now" treatment beside the Guide only when the Guide itself is available.
Make the publishing-section heading, selections, Discovery status, and `/next/`
copy adapt to the actual catalog. Retain restrained forthcoming copy when no books
are available.

Recommended Mastery treatment: keep its stable detail page and secondary catalog
presence, but omit it from prime homepage recommendations while it is only a
concept. If later hidden from discovery surfaces, use explicit catalog visibility
and make chooser/family rendering handle empty selections safely. Do not delete
stable routes or hide the five books with real artwork.

## 6. Add a real contact route if confirmed

Inspect relevant configuration for an explicitly designated publisher contact,
without exposing credentials or treating an account email as a monitored mailbox.
If confirmed, store the public address once and add a simple `mailto:` link to the
footer and About page. Add it to Privacy only if useful. Do not send a test message
without authorization.

If no monitored public address is confirmed, record `TODO: publisher contact email`
in project documentation and the completion report. Do not publish a fake address
or a broken contact control. This is an unresolved input, not a reason to stop the
availability implementation.

## 7. Validate both launch states and regressions

Extend tests around the actual generated output, using isolated fixture catalogs
or temporary build directories. Never commit fixture purchase data to production.
Include availability/content assertions in the checks that run under `STATIC_ONLY`
so deployment CI does not skip them.

Required cases:

- Available book with both Amazon URLs, ISBN, ASIN, and author.
- Available book with one marketplace URL, then with neither URL.
- Forthcoming book with no identifiers or links; forthcoming with a supplied link.
- Mixed catalog, all forthcoming, and all available; correct filtered counts and
  stable ordering; a non-Guide book available while the Guide remains forthcoming.
- Affiliate-link tests: the configured ID appears exactly once on eligible
  links; existing query parameters/fragments and destinations survive; missing
  URLs stay absent; unconfigured marketplaces and unrelated links stay unchanged;
  disclosure and sponsored-link attributes render with affiliate purchase links.
- Author and publisher JSON-LD objects, title consistency, conditional ISBN, real
  supplied URLs only, unchanged canonicals/slugs, and no invented offers.
- Core-family ordering, Discovery links, Mastery treatment, and `/next/` navigation.

Run `npm run build` and `npm test`. Retain all existing link, ASCII, keyboard,
accessibility, and overflow checks at 1440px, 390px, and 320px. Visually review the
homepage, mixed catalog, available detail page, forthcoming detail page, and any
regenerated sample. Confirm cover provenance/integrity checks still pass.

## 8. Document and release

Update `README.md` to remove the instruction to edit templates at launch. The
routine publishing workflow becomes:

1. Verify the final book identity and real marketplace listing destinations.
2. Set that book's `status` to `Available` in `src/catalog.mjs`.
3. Add confirmed ISBN/ASIN and available Amazon.ca/Amazon.com URLs. Confirm the
   marketplace affiliate configuration uses `annasdadpress-20` where applicable;
   the shared helper applies tracking without per-book template edits.
4. Build, test, and review the rendered purchase section.
5. Commit and push through the existing Pages workflow; verify live pages, links,
   cover images, and HTTPS after deployment.

Separate implementation readiness from release readiness: the code can be complete
with every real book still forthcoming. Do not announce an available book until
its release is confirmed. Missing final branding/specs block the corresponding
claims; missing contact email and an explicitly labelled draft sample remain
reported follow-ups rather than fabricated launch details.

The implementation completion report should list changed files, the publishing
workflow, confirmed branding changes, missing real-world values, contact status,
validation results, and any remaining launch blockers.

## Expected files

- `src/catalog.mjs`: verified names, author, publication data, optional visibility.
- `scripts/build.mjs`: shared rendering and ordering across all affected surfaces.
- Shared publisher/link configuration: Associate ID `annasdadpress-20` and
  confirmed marketplace mapping.
- A small helper module and focused test file if needed for fixture coverage and
  affiliate URL handling.
- `scripts/check.mjs`: semantic assertions and updated navigation selectors.
- `public/assets/style.css`: only minimal byline/status/emphasis adjustments.
- `scripts/extract-samples.py` and `public/assets/samples/`: only if refreshing the
  verified Guide excerpt.
- `README.md`: publishing instructions, confirmed facts, and unresolved TODOs.
- `package.json` or the existing workflow only if needed to run new checks.

No cover-sync, domain, hosting, solver, or manuscript changes are required by this
plan unless verification reveals a directly relevant defect.
