# Anna’s Dad Press

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

Tests verify internal links/assets, unique titles, one H1 per page, valid structured data, all 17 pages at desktop and two mobile widths, WCAG A/AA automated checks, catalog filtering, book selection, and keyboard navigation. Desktop/mobile screenshots are written to ignored `artifacts/`. Automated accessibility checks are supplemented by visual review; they are not a claim of formal certification.

## Content and artwork

`src/catalog.mjs` holds the five initial books and four families. Add books to this array to generate catalog entries and individual pages. Book fields include stable `slug`, `title`, `subtitle`, `family`, `collection`, `status`, `cover`, `coverStatus`, `description`, `bestFor`, `isbn`, `asin`, `amazonCa`, `amazonCom`, and `sampleSpreads`.

All titles are forthcoming. ISBNs, ASINs, final publication dates, and Amazon URLs are unknown and intentionally unset. Confirm the status before launch of each book; adjust availability copy in the shared book template when purchase links are supplied. Do not use invented purchase links. The Mastery subtitle is also unconfirmed.

The four supplied PNGs in `sample_covers/` are concept artwork. They are converted to 360px and 720px WebP assets at build time. The Mastery cover is a clearly marked HTML placeholder. Replace concepts with approved artwork before the books launch. `sampleSpreads` drives the interior preview. The Guide includes draft printed pages 82–83 (PDF pages 86–87): responsive X-Wing page images, full-size image links, a two-page PDF, and a text explanation. Pages sit side by side on desktop and stack on mobile. The complete review manuscript is ignored by Git and is never copied into the site. To re-extract the selected excerpt, install PyMuPDF in a local Python environment and run `python scripts/extract-samples.py [path/to/review.pdf]` after `npm ci`; visually inspect the selected pages if pagination changes. Only the resulting files in `public/assets/samples/` are published. Normal builds use these committed assets and need no Python installation. The existing solver is hosted separately at https://sudoku.annasdadpress.com/ (the `anicolao/sudoku` GitHub Pages repository). The book page and `/next/` link to it. Book QR URLs are generated in the private manuscript repository from its shared `SUDOKU_APP_BASE_URL` setting.

The publisher identity and reusable catalog permit future non-Sudoku collections. Add their collection navigation/landing page and supply their family metadata when the next publishing program is known; do not repurpose existing printed slugs. `/next/` is the stable reader-resource hub. GitHub Pages also serves this route when readers enter `/next`.

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on pushes to `main`. Enable Pages with GitHub Actions as its source. HTTPS is enabled for the publisher and solver domains. A final workflow job verifies the publisher certificate and HTTPS enforcement. GitHub’s default Actions token cannot change that setting; if it is ever disabled, restore it through repository Pages settings or an authenticated administrator’s CLI. The generated site includes canonical URLs, Open Graph and Twitter metadata, a social image, favicon, Organization/Book JSON-LD, sitemap, robots file, and a 404 page.

For the primary domain, leave the repository variable `BASE_PATH` unset. The build emits `CNAME` with `annasdadpress.com`. To temporarily preview on a GitHub project URL, set `BASE_PATH=/annasdadpress` as a repository Actions variable. Canonicals always identify the intended .com domain. Remove the preview variable when the custom domain is connected.

Configure DNS for the .com apex using GitHub Pages A records:

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

Set `www` as a CNAME to `anicolao.github.io`. Set the GitHub Pages custom domain to `annasdadpress.com`, wait for the certificate, and enable HTTPS. Preserve unrelated records, especially mail and domain verification records. Verify the domain in GitHub account settings using GitHub’s supplied TXT challenge when available.

The .ca domain uses two active Cloudflare Page Rules: `annasdadpress.ca/*` and `www.annasdadpress.ca/*`, each forwarding permanently (301) to `https://annasdadpress.com/$1`. The wildcard preserves paths and query strings. Both hostnames have proxied A records pointing to the documentation address `192.0.2.1`; Cloudflare handles the redirect without contacting an origin. The supplied token supports DNS and Page Rules; the newer Rulesets API is not available with its current permissions. Preserve existing unrelated rules when updating these. API credentials live only in the ignored `.env` file and must never be committed.

Official setup references: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Cloudflare Page Rules forwarding](https://developers.cloudflare.com/rules/page-rules/how-to/url-forwarding/).

## Publishing checklist

Confirm final covers and interiors, title/subtitle spellings, publication status, ISBNs/ASINs, and the two marketplace URLs. Validate printed QR codes against https://sudoku.annasdadpress.com/ before release. Review the factual privacy page if hosting, analytics, or forms change. No contact address has been invented.
