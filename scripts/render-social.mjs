// Render share cards with the same CSS font stack as the site, not librsvg's fallback.
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { books } from "../src/catalog.mjs";
import { publisherMark } from "../src/icons.mjs";
import { escapeHtml as esc } from "../src/publishing.mjs";
const browser = await chromium.launch();
try {
  await mkdir("public/assets/social", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const style = `<style>*{box-sizing:border-box}body{margin:0;background:#f7f6f0;color:#172f3d;font-family:Georgia,'Times New Roman',serif}.card{width:1200px;height:630px;padding:55px 65px;display:flex;align-items:center;gap:65px}.copy{flex:1}.brand{display:flex;align-items:center;gap:20px;font-size:28px;margin-bottom:48px}.brand svg{width:65px;height:65px;color:#066568}h1{font-size:54px;line-height:1.1;font-weight:normal;margin:0 0 28px}p{font:23px/1.5 Arial,sans-serif;color:#586770}img{max-width:340px;height:500px;object-fit:contain;box-shadow:8px 10px 20px #21372b25}.url{font:18px Arial,sans-serif;color:#066568;margin-top:40px}</style>`;
  for (const b of [null, ...books]) {
    const cover = b
      ? `<img src="data:image/png;base64,${(await readFile(b.coverSource)).toString("base64")}" alt="">`
      : "";
    await page.setContent(
      `${style}<div class="card"><div class="copy"><div class="brand">${publisherMark()}<span>Anna's Dad Press</span></div><h1>${esc(b?.title || "A little curiosity. A new perspective. Your next step.")}</h1><p>${esc(b?.subtitle || "Thoughtfully made books.")}</p><div class="url">annasdadpress.com</div></div>${cover}</div>`,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode()));
    });
    await page.screenshot({
      path: b
        ? `public/assets/social/${b.cover}.png`
        : "public/assets/social.png",
    });
  }
} finally {
  await browser.close();
}
