# Launch readiness results

Implemented September 18, 2026, from `LAUNCH_REVIEW_PLAN.md`.

## Delivered

- Publication status now drives cards, filtered catalog summaries, purchase copy,
  homepage emphasis, the Discovery feature, and book recommendations. Available
  books sort first without changing the Guide hero or stable URLs.
- Existing marketplace URLs produce buttons. Missing URLs produce no invented
  links. Forthcoming listings use "View on"; available listings use "Buy on".
  An available book without URLs displays truthful purchase-link-pending copy.
- Book pages show an Alex Nicolaou byline and a Person author in Book JSON-LD.
  Anna's Dad Press remains the publisher.
- Core families precede Discovery. The seasonal Advent feature remains prominent.
  Mastery's concept page stays accessible but is excluded from prime homepage and
  related-book recommendations while forthcoming.
- Publisher contact and affiliate settings have one configuration location.
  Confirming a contact address enables footer and About mailto links.
- Affiliate purchase links preserve destinations, other query parameters, and
  fragments; configured tags replace duplicate/old tags. Tagged links show a paid
  link label, sponsored relationship, and the Associate disclosure near purchase
  links and in the footer. Anna's separate Amazon store link is unchanged.
- The Guide copy now states verified format and puzzle count without presenting
  changing pagination as final. Its existing sample remains explicitly draft.

## Files and responsibilities

| Files                                                  | Changes                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `src/catalog.mjs`                                      | Author defaults, verified titles/subtitles, two ISBNs, Guide facts, family order, and explicit Mastery concept flag |
| `src/publisher.mjs`                                    | Author, public contact setting, supplied Associate ID, and marketplace tag configuration                            |
| `src/publishing.mjs`                                   | Availability, ordering, summary, purchase, affiliate URL, escaping, and validation helpers                          |
| `scripts/build.mjs`                                    | Shared helpers throughout site rendering; isolated output/catalog injection for tests                               |
| `scripts/check-launch.mjs`                             | Generated publication-state fixtures, affiliate tests, metadata checks, and responsive/accessibility checks         |
| `scripts/check.mjs`                                    | Author assertions, fixture-leak checks, and updated Practice! selector                                              |
| `package.json`                                         | Run launch checks before existing site checks, including deployment CI's static-only mode                           |
| `public/assets/style.css`                              | Available badge, byline, wrapping marketplace buttons, disclosure, and contact link styling                         |
| `README.md`                                            | Catalog-only publication workflow, affiliate/contact setup, evidence and follow-up references                       |
| `LAUNCH_REVIEW.md`, `LAUNCH_REVIEW_PLAN.md`, this file | Review brief, implementation plan, and outcome record                                                               |

The review brief and plan were already local files before implementation and are
retained as project documentation. Cover assets, cover syncing, manuscript files,
DNS, hosting configuration, sample assets, and the solver were not changed.

## Verified facts and branding

Evidence was read from `../sudoku-challenges/` without modifying it:

- `covers/practice-xwing.toml`: the book and family now use `Practice!` branding.
- `covers/start-here.toml`: the title now says `with Visual Hints`; the subtitle is
  `See the Pattern. Use It. Find It Again.` The source uses START HERE without an
  exclamation mark, so the existing colon treatment is retained pending final KDP
  metadata confirmation.
- `covers/candidates-done.toml`: subtitle copy now includes `Just Start Solving`,
  `Candidate Notes Already Filled In`, and `Focus on Your Next Deduction`. The
  source does not establish an exclamation mark; no new punctuation is invented.
- No Mastery publication/cover establishing an Advanced Sudoku title was found.
  The existing Hard Sudoku title and URL remain until confirmed.
- The Guide's current manifest has 45 full-puzzle placements. Its cover config
  specifies standard colour and 6 x 9 trim. These facts are now visible on its page.
- Guide ISBN `978-1-0681462-0-6` appears in both its print and current review PDFs.
- Advent ISBN `9798174365575` appears in `print/advent-2026-print.pdf`.
- The Guide print PDF has 253 physical pages; its current review PDF has 285 and
  its sizing record has 286 KDP pages. The old approximate 250-page claim was
  removed. No exact final page count is asserted.
- Draft sample pages 82-83 were not relabelled as final. Final sample extraction
  awaits a confirmed final edition and page selection.

These are manuscript-backed website values, not a claim that KDP listings are live.

## Affiliate and contact configuration

The supplied Associate ID `annasdadpress-20` is stored in `src/publisher.mjs`.
Marketplace tag mappings are intentionally null pending confirmation of the account
marketplace and any applicable OneLink setup. The renderer and tests support the
ID now; no live affiliate purchase links exist because product URLs are not supplied.

The implementation follows Amazon's current guidance to disclose links near their
placement and identify the publisher with: "As an Amazon Associate I earn from
qualifying purchases." See [Amazon's disclosure guidance](https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98).
Amazon describes cross-marketplace OneLink as requiring account setup; it cannot
be inferred from an ID alone. See [Amazon's OneLink guidance](https://affiliate-program.amazon.com/help/node/topic/GC4NVV7K3XNG99X5).

TODO: confirm a monitored publisher contact email. No contact-related `.env` keys
or designated public email were found; no account address was repurposed.

## Publishing workflow

1. Confirm the book's actual release and final marketplace destinations.
2. Edit its `src/catalog.mjs` entry: set `status: "Available"`, supply confirmed
   ISBN/ASIN values, and add the real Amazon.ca/Amazon.com URLs that exist.
3. Once per marketplace, configure the confirmed affiliate tag in
   `src/publisher.mjs`. Leave an unconfirmed marketplace untagged.
4. Run `npm run build` and `npm test`; review the rendered purchase section.
5. Commit and push. After the existing Pages workflow succeeds, verify the live
   page, cover, purchase destinations, and HTTPS.

No template edits are needed to release another book.

## Validation

- Normal build: 19 pages.
- Existing tests: internal links/assets, ASCII markup/text, metadata, navigation,
  keyboard skip link, and all pages at 1440px, 390px, and 320px.
- Launch fixtures: all forthcoming, mixed, and all available catalogs; stable
  ordering and counts; non-Guide availability while the Guide remains forthcoming;
  both, single, and absent purchase URLs; forthcoming listing links; author,
  publisher, ISBN, canonical, and title data; preserved resource and family routes.
- Affiliate tests: one configured tag, preserved query/fragment/destination,
  unchanged unconfigured marketplace URLs, rejected incorrect/non-Amazon hosts,
  absent links, disclosures, and sponsored attributes.
- Mixed-state browser checks: homepage, catalog, available book, forthcoming Guide,
  and forthcoming listing page at all three viewport widths, with automated
  accessibility checks. Screenshots are in ignored `artifacts/` for visual review.
- Fixture data is isolated in temporary output directories, removed after tests,
  and checked against leakage into production output. Static semantic fixture
  checks run in deployment CI even when browser checks are disabled.

## Remaining release inputs

- Actual availability and real Amazon.ca/Amazon.com URLs for the first live title.
- All ASINs; ISBNs other than the two verified manuscript values above.
- Final KDP title/punctuation reconciliation for Start Here and Candidates Done;
  confirmation of the proposed Mastery Advanced Sudoku title.
- Associate account marketplace/OneLink applicability and public contact email.
- Final Guide pagination and a frozen source for a final sample, if desired.

The rendering work is ready. All real books remain forthcoming because no release
confirmation or purchase URLs have been provided. Missing launch data blocks
announcing a live product, not deployment of this readiness update. Contact and
final sample follow-ups are documented rather than replaced with invented values.
