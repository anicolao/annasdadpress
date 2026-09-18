# Anna's Dad Press

A static publisher website for https://annasdadpress.com. Built from reusable HTML templates and a small catalog module. No browser JavaScript, remote fonts, analytics, cookies, or runtime dependencies.

## Local development

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. After editing `src/catalog.mjs`, `scripts/build.mjs`, or `public/assets/style.css`, run `npm run build` and refresh. The development server serves `dist/`. Stop it before running the browser tests, which start their own server.

```sh
npm run build
npx playwright install chromium
npm test
```

Launch tests build isolated all-forthcoming, mixed, and all-available catalogs, verify affiliate URL handling and author metadata, and check mixed-state pages in the browser. These fixtures are never copied to `dist/`; semantic launch tests also run under `STATIC_ONLY=1` in deployment CI. Tests verify internal links/assets, unique titles, one H1 per page, valid structured data, all 19 pages at desktop and two mobile widths, WCAG A/AA automated checks, catalog filtering, book selection, and keyboard navigation. Desktop/mobile screenshots are written to ignored `artifacts/`. Automated accessibility checks are supplemented by visual review; they are not a claim of formal certification.

## Content and artwork

`src/catalog.mjs` holds six books and five families. Add books to this array to generate catalog entries and individual pages. Book fields include stable `slug`, `title`, `subtitle`, `family`, `collection`, `status`, `cover`, `coverStatus`, `description`, `bestFor`, `isbn`, `asin`, `amazonCa`, `amazonCom`, and `sampleSpreads`.

All titles remain forthcoming until release is confirmed. The Guide and Advent ISBNs
are recorded from their manuscripts; other ISBNs, ASINs, release dates, and Amazon
URLs await confirmation. See `LAUNCH_REVIEW_RESULTS.md` for the evidence and pending
branding decisions. Artwork status is separate from release status.

To publish a title, edit only its record in `src/catalog.mjs`:

1. Confirm that the book is available, then set `status: "Available"`.
2. Add verified ISBN/ASIN values and full HTTPS Amazon.ca/Amazon.com product URLs.
   Leave missing marketplace URLs null. Do not guess links from identifiers.
3. Run `npm run build` and `npm test`, review the page, then commit and push.
4. Verify the live page and marketplace destinations after Pages deployment.

Cards, filtered counts, purchase sections, homepage emphasis, and recommendations
adapt automatically. No template edits are required for a release. Available
books sort first without moving the Guide hero. A forthcoming book with a supplied
listing URL has a neutral "View on" link. An available book without URLs remains
labelled available and says purchase links are pending. Books with verified artwork participate in recommendations while forthcoming;
concept entries remain excluded until available.

`src/publisher.mjs` owns author/contact configuration and Associate ID
`annasdadpress-20`, confirmed for the Amazon.com (US) account. Amazon.com purchase
links use this tag automatically. Amazon.ca remains untagged until Canadian
affiliate eligibility or applicable OneLink setup is confirmed. Unconfigured marketplaces keep
their supplied links unchanged. Affiliate links receive one tag, a visible paid-link
label, `rel="sponsored"`, and the Associate disclosure. Anna's separate store link
is not modified. No tracking scripts or cookies are added.

TODO: confirm the monitored publisher contact email. Set `contactEmail` in
`src/publisher.mjs` to add the footer/About mailto links. No public address is
inferred from hosting credentials or Git metadata.

All six books have real cover artwork and a two-page sample from the print
manuscript. Samples include responsive images, a downloadable PDF, and a text
description. Only the selected pages are published; complete manuscripts stay in
the private book repository. Normal builds need only committed assets, not Python
or the manuscript repository. The solver is hosted separately at
https://sudoku.annasdadpress.com/; `/next/` is the stable reader-resource hub.


The publisher identity and reusable catalog permit future non-Sudoku collections. Add their collection navigation/landing page and supply their family metadata when the next publishing program is known; do not repurpose existing printed slugs. `/next/` is the stable reader-resource hub. GitHub Pages also serves this route when readers enter `/next`.

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on pushes to `main`. Enable Pages with GitHub Actions as its source. HTTPS is enabled for the publisher and solver domains. A final workflow job verifies the publisher certificate and HTTPS enforcement. GitHub's default Actions token cannot change that setting; if it is ever disabled, restore it through repository Pages settings or an authenticated administrator's CLI. The generated site includes canonical URLs, Open Graph and Twitter metadata, a social image, favicon, Organization/Book JSON-LD, sitemap, robots file, and a 404 page.

For the primary domain, leave the repository variable `BASE_PATH` unset. The build emits `CNAME` with `annasdadpress.com`. To temporarily preview on a GitHub project URL, set `BASE_PATH=/annasdadpress` as a repository Actions variable. Canonicals always identify the intended .com domain. Remove the preview variable when the custom domain is connected.

Configure DNS for the .com apex using GitHub Pages A records:

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

Set `www` as a CNAME to `anicolao.github.io`. Set the GitHub Pages custom domain to `annasdadpress.com`, wait for the certificate, and enable HTTPS. Preserve unrelated records, especially mail and domain verification records. Verify the domain in GitHub account settings using GitHub's supplied TXT challenge when available.

The .ca domain uses two active Cloudflare Page Rules: `annasdadpress.ca/*` and `www.annasdadpress.ca/*`, each forwarding permanently (301) to `https://annasdadpress.com/$1`. The wildcard preserves paths and query strings. Both hostnames have proxied A records pointing to the documentation address `192.0.2.1`; Cloudflare handles the redirect without contacting an origin. The supplied token supports DNS and Page Rules; the newer Rulesets API is not available with its current permissions. Preserve existing unrelated rules when updating these. API credentials live only in the ignored `.env` file and must never be committed.

Official setup references: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Cloudflare Page Rules forwarding](https://developers.cloudflare.com/rules/page-rules/how-to/url-forwarding/).

## Publishing checklist

Confirm final covers and interiors, title/subtitle spellings, publication status, ISBNs/ASINs, and the two marketplace URLs. Validate printed QR codes against https://sudoku.annasdadpress.com/ before release. Review the factual privacy page if hosting, analytics, or forms change. No contact address has been invented.

## Illustration and text

`src/icons.mjs` owns the original SVG path artwork: the open-book publisher mark, printers' ornament, navigation arrows, and four series symbols. These are decorative, hidden from assistive technology, and never keyboard targets. The favicon and social image share the publisher mark. Website text and metadata use ASCII punctuation; decorative marks use SVG paths instead of Unicode or icon fonts. Supplied cover artwork and book excerpts retain their source typography.

## Refreshing books and samples

Use this after MathPub has produced the print interiors and reviewed covers:

```sh
npm run books:refresh -- --source ../sudoku-challenges
# Or refresh one book:
npm run books:refresh -- --source ../sudoku-challenges --book mastery
npm run build
npm test
```

Keys: `guide`, `advent-2026`, `practice-xwing`, `start-here`, `candidates-done`,
`mastery`. Requires Nix, npm dependencies, and Playwright Chromium. Nothing
rebuilds or edits the manuscripts. Review asset/provenance diffs and screenshots
before committing and pushing to publish.

The existing `covers:sync -- --source ... [--book KEY] [--review]` command now also
refreshes that book's sample and the share cards. Its default book is the Guide.
Use `samples:sync -- --source ... [--book KEY]` for an interior-only refresh;
without a book it refreshes all six. `social:refresh` renders the landscape share
images with the site's browser font stack; these PNGs are committed so CI cannot
silently substitute a different font. Refresh them after title/subtitle changes.

### How sample selection survives repagination

`src/samples/selections.json` is the editorial selection contract: explicit print
path, identifying title fragments, trim dimensions, two sets of semantic anchors,
and reader-facing descriptions. Each anchor set must resolve to exactly one
page. The importer checks adjacency, extracts the actual printed page numbers,
and stops if a heading disappears, duplicates, or ceases to form a spread. It
never falls back to old page numbers or silently picks the first match. Ordinary
front-matter additions move the selection without breaking it.

All print PDFs must identify a clean MathPub source revision, have the expected
trim, and contain no annotations. When the adjacent export receipt includes that
PDF, its hash, revision, page count, and unchanged-content flag are checked. The
root receipt currently only covers its latest export batch: Guide and Advent
therefore record `receiptVerified: false`, their actual PDF hash, and embedded
source revision. This distinction is explicit, not a claim of receipt validation.

Importing writes two responsive WebPs per page, a two-page PDF, and a manifest in
`src/samples/KEY.json`. Manifests record the source hash/revision, selection hash,
PDF/printed page numbers, dimensions, and output hashes. Every requested sample
is validated and rendered in a temporary directory before any sample is replaced.
Normal builds verify all sample hashes and reject changed selections until the
samples have been refreshed. Descriptions intentionally avoid puzzle-specific
numbers that can change when puzzles are regenerated. Review them if a book's
teaching method changes. Only excerpts and descriptive metadata are published.

The Guide's old PDF URL is retained as an alias to its refreshed excerpt. The
obsolete fixed-page extractor has been removed. Selection regression tests cover
inserted pages, ambiguous/missing headings, number-prefix collisions, punctuation,
and duplicate selections:

```sh
(cd ../sudoku-challenges && nix develop -c python ../annasdadpress/scripts/check-samples.py)
```

### Cover sources and failed refreshes

Guide and Advent use validated review cover builds, checked against current
sources. The Guide print wrap still has older coral artwork, so its last verified
teal cover remains the published cover. Practice, Start Here, and Candidates Done
use paired print exports and receipts in their respective print subdirectories;
`--review` selects their checked current review covers instead. Mastery uses
`print/mastery-cover-print.pdf`, `print/mastery-print.pdf`, and the root receipt;
it does not support `--review`.

Cover sync validates hashes, dimensions, and source evidence, then crops only the
front trim panel. Committed PNGs and provenance JSON feed normal build-time WebP
conversion. If a source checker says a cover is stale, finish that cover build in
MathPub and rerun; do not bypass the check. An all-books refresh can stop after
earlier books were imported. Treat a failed run as incomplete and do not publish
it automatically. Cover and print-interior revisions may differ, and their
separate manifests preserve that fact. No import changes publication status.

Book URLs remain stable, including `/books/mastery-hard-sudoku/`. The legacy
`/books/sudoku/` route points its canonical to `/books/` and is no longer a redundant
catalog filter.

## Publisher email forwarding

`alex@annasdadpress.com` is the requested contact alias. The token initially
provided in `.env` returns 403 for Email Routing; no mail DNS has been changed.
Update its permissions for the relevant account and zone: Email Routing Addresses
Edit, Email Routing Rules Edit, Email Routing Settings Edit, Zone Settings Edit,
and DNS Edit (retain Zone Read). Do not commit credentials.

```sh
node --env-file=.env scripts/setup-email.mjs --destination DESTINATION_EMAIL
node --env-file=.env scripts/setup-email.mjs --destination DESTINATION_EMAIL --apply
```

The first command inspects; `--apply` registers the destination if needed, waits
for its Cloudflare verification, enables routing DNS, and creates the exact alex
rule. It can be rerun after verification and refuses conflicting MX records or an
existing alex rule with a different destination. It preserves other routes. The
script verifies enabled settings/rule before reporting success; inbox delivery
still needs an actual incoming-message check. Once active, set `contactEmail` in
`src/publisher.mjs` to `alex@annasdadpress.com`, build, test, and publish. This is
incoming forwarding, not an outgoing SMTP mailbox.

API references: [Enable routing DNS](https://developers.cloudflare.com/api/resources/email_routing/subresources/dns/methods/create/),
[Create forwarding rules](https://developers.cloudflare.com/api/resources/email_routing/subresources/rules/methods/create/).
