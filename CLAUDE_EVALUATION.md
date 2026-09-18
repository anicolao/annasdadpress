# Launch-readiness evaluation: annasdadpress.com

Reviewed September 18, 2026 against the live site (deployed from `4b11482`). Scope: content, layout, and copy. Books are known to be unpublished; nothing below treats "Forthcoming" status or missing purchase links as a defect. No code was changed.

Method: fetched every URL in the sitemap plus the 404 page, read the full text of each, screenshotted all pages at 1440px and 390px with Playwright, probed layout at 360–1024px, and checked outbound links, redirects (`www`, `.ca`, `/next`), structured data, and the social image.

## Verdict

**Close, but not quite launch-ready.** The site is technically solid and the writing is far above the usual small-press standard. What holds it back is a handful of things a first-time visitor will notice: a production-status label ("Print cover artwork") leaking into the customer-facing UI, five of six book pages showing a "sample pages are on their way" placeholder, an About page that never names the author and offers no way to contact the publisher, a spelling inconsistency in the most prominent new book's blurb, and one real mobile layout bug. None of these are large, but together they make the site read as "almost finished" rather than "finished." Fix the items under **Blockers** and it is ready to point people at.

## Blockers (fix before sharing the URL)

1. **"Print cover artwork" appears as visible copy on every book page and under the homepage hero.**
   It is a `coverStatus` field from the catalog, and to a reader it reads as a caption or a placeholder, not as reassurance. On the hero it sits under the cover as a lonely grey line: "Print cover artwork". On book pages it is the first thing under the cover image. Either drop it from the rendered page, or reword it into something a reader would understand ("Final cover" / nothing at all). Note the `alt` text carries it too: `"The Sudoku Learner's Guide: Print cover artwork"`.

2. **Five of six book pages show a placeholder "A look inside / Sample pages are on their way / Interior spreads will be shared here when they're ready."**
   This is honest, but it is a large tinted block that says "unfinished" on 83% of your product pages. Only the Guide has a real sample. Options: hide the section entirely until there is a sample for that book, or replace the block with something small and useful (a one-line "Sample pages coming soon" under the description). A full section heading whose only content is an apology is the single biggest signal that the site launched early.

3. **The About page never says who "her dad" is, and there is no way to contact the publisher anywhere on the site.**
   The byline "by Alex Nicolaou" appears on book pages, but the story page talks about "her dad" four times without a name. For an independent press whose brand *is* the family relationship, the About page should say the author's name once. Separately, there is no email, no contact form, no social handle — nothing. A reader who finds an error in a book, a bookseller, or a reviewer has no path. README notes `contactEmail` is a pending TODO; this should be resolved before launch, even if it is just a mailto link in the footer.

4. **Mobile layout bug: the Advent cover in the homepage Discovery feature collapses to a 60×60px pink square until the lazy-loaded image arrives, then jumps to ~350×420px.**
   Reproduced at 390px viewport. Cause: `.discovery-cover` uses `max-width: 360px; margin: 0 auto` inside the single-column grid. Auto margins suppress grid `stretch`, so the anchor shrinks to fit its content, and an unloaded `<img>` contributes 0 intrinsic width even with `width`/`height` attributes. On a fast connection most users will scroll past before it loads; on a slow connection they see an empty box followed by a large layout shift. `width: 100%` on the anchor (or `justify-self: center` instead of auto margins) fixes it. Playwright's full-page screenshots hide this because they don't scroll, which is probably why the visual test passed.

5. **"coloring" (US) in the Mastery blurb vs. "colour", "recognise", "practise" everywhere else.**
   The Mastery description ("deeper chains and coloring") appears on the homepage catalog, `/books/`, `/books/sudoku/`, `/books/mastery/`, and the book page — five places. Every other word on the site uses Canadian/British spelling. Change to "colouring". ("Simple Colors" as a technique name in the Guide's chapter list is a proper noun and can stay, but be aware the two now sit near each other.)

## Should fix (visible quality issues, not launch-blocking)

### Copy

- **Tagline sprawl.** The site currently carries at least five brand lines: "Books for curious minds" (title tag), "Independent minds. Thoughtful books." (hero eyebrow), "A little curiosity. A new perspective. Your next step." (H1), "Made for curious minds. At every stage." (hero note), and "Thoughtfully made books. A little more understanding, one page at a time." (footer). Individually fine; together they dilute. Pick two.
- **"Publication date to be announced" contradicts the Advent book's own copy.** The subtitle, description, tags, and feature section all say "December 2026", then the purchase block says the date is TBA. Say "Expected December 2026" (or similar) in the purchase block for that book, or make the rest of the page stop promising a month.
- **The Advent "how it works" copy is hard to picture.** "Use your Sudoku answers and the printed lookups to join numbered dots on the day's drawing tile" and "Combine the 6-inch tiles into one large festive picture" leave a reader unsure whether they cut pages out of the book, whether tiles are perforated, or whether the picture assembles on a separate sheet. One sentence of physical description would help — this is the book with the most novel mechanic and the least explanation.
- **Guide page "Learn / See / Walkthrough / Practice / Solve" strip.** Five bare words with no supporting text, and "Walkthrough" is a noun among four verbs. The library page does the same pattern properly (heading + one-line description). Either add a line under each or cut the strip.
- **Library page "Learn → Practice → Get guidance → Solve independently" is a four-step ladder, immediately followed by a heading that says "A library, not a ladder."** It also omits Discovery, so the 4-step journey and the 5-family grid below it don't match. Small tension, but it is the first thing on the collection's flagship page.
- **Nav says "The Sudoku Library"; the collection is "The Sudoku Learner's Library"; the catalog filter chip says "Sudoku Learner's Library".** Three variants of one name. The nav abbreviation is understandable for width, but the chip and nav should agree.
- **ISBN formatting is inconsistent.** Guide shows `978-1-0681462-0-6` (hyphenated); Advent shows `9798174365575` (raw). Hyphenate both or neither. (Also confirm the Advent ISBN is the one you want public — a 979-8 prefix is typically KDP-assigned and won't be usable outside Amazon.)
- **"Independent minds. Thoughtful books."** is the eyebrow over a hero that then says "Books that make the unfamiliar understandable." "Independent minds" is a slightly odd claim for a publisher (independent *press*, yes). Consider "Independent press. Thoughtful books."
- **Mastery URL is `/books/mastery-hard-sudoku/` for a book titled "Mastery! Advanced Sudoku".** README says slugs are frozen because printed QR codes reference them. If Mastery has not gone to print yet, this is the last chance to make the slug match the title. If it has, leave it.
- **Privacy page describes affiliate "paid link" labels that don't exist on the site yet.** Forward-looking and harmless, but a careful reader may look for them. Fine to leave; noting for completeness.
- **`/books/sudoku/` is a byte-for-byte duplicate of `/books/` with a different `<title>`** ("Sudoku book catalog"). With one collection, the "All books" and "Sudoku Learner's Library" filter chips do the same thing. Not wrong, but the redundancy is visible on the filter row. Consider hiding the collection chip until a second collection exists, or adding `rel="canonical"` from `/books/sudoku/` to `/books/`.

### Layout

- **Homepage "Your next chapter is coming" grid: card heights don't align.** The Guide is 6×9; the other two are 8×10. The cover tile for the Guide is ~490px tall vs ~420px for the others, so the three titles sit ~70px apart vertically. Fix by giving `.book-art` a fixed aspect ratio and letting covers `object-fit: contain`. The same misalignment shows in every "More ways to learn" recommendation row on book pages when the Guide is one of the three.
- **Discovery card in the family grid (homepage and library page) is full-width by design, but reads as an orphan.** Four cards in a row, then one card the width of all four, with a single 700px sentence floating in ~1200px of tinted space. The tint helps, but the proportions still look like a grid that ran out of columns. Either give it a two-column internal layout (copy left, something right — the Advent cover would be ideal), or make it 2-up with an "Add your own" / "More families coming" card.
- **Forced `<br class="desktop">` line breaks produce ragged paragraphs at some widths.** Most visible on the library page ("Use the Guide as your reference. Choose Practice for a specific / technique, Start Here for a hint, or Candidates Done to skip / setup. Mastery gives you room to solve on your own. Discovery adds a creative reward: puzzles that reveal a picture.") — two short lines, then one long one. Same technique on the homepage intro paragraph. Let the browser wrap; use `max-width` on the paragraph instead.
- **Hero "Introducing The Sudoku Learner's Library" card overlaps the author name and third icon on the Guide cover** at 1440px ("ALEX NICOLA…"). Intentional overlap is a fine device, but it currently hides the one piece of text on the cover that identifies the author. Shift it down or right by ~40px.
- **Book page hero has a lot of empty space below the cover on desktop.** The cover column ends around 40% down the viewport; the "Print cover artwork" line floats beneath it; then nothing. Removing that label (Blocker 1) mostly resolves this.
- **Mobile nav drops the "Find your next book" CTA entirely.** `/next/` is the reader-resource hub the books point to (QR codes, solver). On phones it is only reachable from the footer as "Reader resources" — a different label than the desktop nav uses. At minimum, keep one consistent label.

### Assets

- **Social share image uses a fallback font.** `social.png` renders the tagline in what looks like DejaVu Serif rather than the site's serif; the letterforms visibly differ from the live page. Regenerate with the actual font, or use a system serif that matches.
- **Book pages use the portrait 720×1080 cover as `og:image` with `twitter:card=summary_large_image`.** Large-image cards expect ~1.91:1; a portrait cover will be centre-cropped to a strip of grid lines. Either compose a landscape share image per book or switch book pages to `summary` cards.

## What's working well (keep)

- **Writing quality.** The voice is consistent, warm, and specific. "Skip the setup. Find the logic." / "A little direction. Your own discovery." / "A library, not a ladder." are better than most professional publisher copy. The "Which book is right for you?" chooser is genuinely useful.
- **The Guide sample section** is the best thing on the site: real pages, a PDF, full-size links, and a text explanation for screen readers. Every book page should aspire to this.
- **Honesty.** Nothing is oversold. Forthcoming books say forthcoming. The draft sample says draft. Purchase links don't exist until they exist. That restraint is a brand asset.
- **Technical hygiene.** All 18 sitemap URLs return 200; `www` and `.ca` redirect correctly; `/next` → `/next/`; no horizontal overflow at 360/390/1440; no console errors; unique titles; valid Organization and Book JSON-LD with ISBNs and author; canonical URLs; sitemap; robots; real 404 page with useful links; skip link; no third-party scripts; privacy page that is accurate.
- **Cover art.** The six covers form a coherent series and reproduce cleanly at all sizes.
- **The 404 page** ("That page isn't in our library.") is on-brand.

## Page-by-page notes

| Page | State | Notes |
| --- | --- | --- |
| `/` | Good | Hero overlap; latest-books misalignment; Discovery orphan card; mobile Advent cover collapse; "Print cover artwork" caption. |
| `/books/`, `/books/sudoku/` | Good | Duplicate pages; "coloring". Filter row works on mobile. |
| `/books/{family}/` ×5 | Good | Each shows "1 title / 1 forthcoming" — thin but honest. Discovery's eyebrow "First book: December 2026" is a nice touch the others lack. |
| `/sudoku-learners-library/` | Good | Ladder/not-a-ladder tension; ragged forced line breaks; Discovery orphan. |
| `/books/the-sudoku-learners-guide/` | Best page | Bare five-word strip. Everything else is the model for the other five. |
| `/books/25-days-of-christmas-sudoku/` | Needs work | Date contradiction; mechanic unclear; placeholder sample; raw ISBN. |
| `/books/mastery-hard-sudoku/` | OK | "coloring"; slug vs title; placeholder sample. The four-phase breakdown is good. |
| `/books/practice-x-wing-sudoku/` | Thin | Description, "good fit", then placeholder. No detail section like Advent/Mastery have. Page is ~40% chrome. |
| `/books/start-here-hard-sudoku-with-hints/` | Thin | Same as Practice. |
| `/books/candidates-done-hard-sudoku/` | Thin | Same as Practice. Subtitle "Just Start Solving / Candidate Notes Already Filled In / Focus on Your Next Deduction" reads as three taglines separated by slashes rather than a subtitle. |
| `/about/` | Needs work | No author name, no contact, generic monogram where a photo or the two of them would land the story. Otherwise well written. |
| `/next/` | Good | Does its job. Consider adding a line about what the QR codes in each book do, since this is the landing page for them. |
| `/privacy/` | Good | Clear, accurate, appropriately short. |
| `/404.html` | Good | — |

## Suggested order of work

1. Remove or reword "Print cover artwork" (Blocker 1) — 10 minutes, largest perceived-quality gain.
2. Hide or shrink the empty sample section on the five books without samples (Blocker 2).
3. Name the author on About and add a contact email (Blocker 3).
4. "coloring" → "colouring" (Blocker 5).
5. Fix the mobile Discovery cover collapse (Blocker 4).
6. Fixed-aspect `.book-art` tiles so card titles align.
7. Resolve the Advent date contradiction and clarify the tile mechanic.
8. Everything else as time allows.

Items 1–5 are each small edits to `src/catalog.mjs`, `scripts/build.mjs`, `src/publisher.mjs`, or `public/assets/style.css`; together they are an afternoon.
