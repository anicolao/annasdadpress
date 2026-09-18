# Evaluation follow-up

September 18, 2026. Input: `CLAUDE_EVALUATION.md`.

## Implemented

- Removed production cover-status labels from visible text and alt text.
- All six books now have real print-manuscript samples, full-size images,
  downloadable two-page PDFs, accurate page labels, and text descriptions.
  The Guide sample is updated from draft pages 82-83 to print pages 96-97.
  Empty sample sections are omitted rather than rendered as placeholders.
- Named Alex Nicolaou on About and used consistent Canadian spelling.
- Reserved mobile Discovery cover dimensions before loading, aligned mixed-format
  book-card heights, and moved the hero note clear of the Guide's author name.
- Discovery's wide family card now pairs its copy with the Advent cover.
- Removed forced paragraph line breaks, the redundant numbered library ladder,
  and the Guide's unexplained five-word strip.
- Consolidated publisher taglines. Navigation and footer both say Reader resources,
  including on mobile. Removed the redundant collection filter; the retained
  `/books/sudoku/` route canonicals to `/books/`.
- Removed the unsupported publication-date statement from purchase sections.
  December 2026 describes the Advent edition/activity; it is not an inferred
  retail release date. Explained blank-backed drawing pages, personal copies,
  cutting, taping, and the assembled picture's size using the print instructions.
- ISBNs display consistently without hyphens. Both existing identifiers remain
  unchanged in value; no new ISBN assignment or eligibility is inferred.
- Added book-specific 1200 x 630 share cards. They and the publisher card are
  rendered with the same browser font stack as the website and committed, so
  deployment font availability cannot change their appearance.
- Expanded reader-resource QR guidance. Practice, Start Here, and Candidates Done
  pages now show their actual exercises and explain how to use them.

## Refresh workflow

`npm run books:refresh -- --source ../sudoku-challenges [--book KEY]` refreshes
covers, semantic sample selections, and share cards. The existing `covers:sync`
entry point now refreshes samples too. `samples:sync` supports interior-only
updates. `README.md` documents sources, failure handling, and review steps.

Sample extraction uses unique content anchors rather than page offsets. It checks
book identity, trim, clean-source metadata, annotations, and export receipts where
present, records actual PDF and printed page numbers, and verifies committed
asset/selection hashes at build time. Ambiguous or missing anchors fail before
sample replacement. No complete interior is copied to the public repository.
Guide and Advent's root receipt does not include those PDFs; their provenance
explicitly records this and the actual source hash/revision.

The all-books refresh was exercised and stopped on MathPub's existing stale Guide
cover check. Its last verified teal artwork was preserved. Interior-only imports
completed for all six books; the complete Mastery refresh was also exercised.
This website task did not modify or rebuild manuscript sources.

## Preserved deliberately

- Existing book URLs, including Mastery's earlier `mastery-hard-sudoku` slug, remain
  stable for external/book links. Displayed title and metadata use Advanced Sudoku.
- Cover subtitles retain the verified manuscript wording, including Candidates
  Done's three-part subtitle. No KDP metadata is invented.
- The About monogram remains; no authentic author photograph was supplied.
- Conditional affiliate disclosures and privacy wording remain accurate as links
  become available. All books remain forthcoming until release is confirmed.

## Pending: Cloudflare email permissions

The supplied token reads the domain and DNS but returns HTTP 403 authentication
errors for Email Routing settings, rules, and destination addresses. No mail DNS
or forwarding rule was changed, and an unconfigured alias is not advertised.
`scripts/setup-email.mjs` is ready to register/verify the destination, enable mail
DNS, and create the exact alex route once access is granted. See README for scopes
and commands. After successful setup, enable `alex@annasdadpress.com` in publisher
configuration and verify real inbox delivery. The destination stays out of site
content and committed configuration.

## Validation

- Build and publication-state fixtures passed.
- All 19 pages passed internal link, metadata, ASCII, layout, and automated WCAG
  A/AA checks at 1440, 390, and 320 pixels.
- Deliberately delayed Advent image loaded without a cover-size shift.
- Mixed-format card heights aligned; mobile reader-resource navigation remained
  visible; catalog/chooser/keyboard interactions passed.
- Five semantic-selection tests passed: pagination moves, missing/ambiguous anchors,
  number-prefix collisions, punctuation/line breaks, and duplicate-page selection.
- Visually reviewed all six spreads, desktop/mobile layouts, and a book share card.
