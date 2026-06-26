import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'node:fs';

const OUT = process.argv[2] || '/tmp/finhome-shots';
fs.mkdirSync(OUT, true ? { recursive: true } : undefined);

const targets = [
  { name: 'framer', url: 'http://localhost:8899/index.html' },
  { name: 'next', url: 'http://localhost:3000/' },
];
const viewports = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 2000) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch({ channel: 'chrome' });
for (const vp of viewports) {
  for (const t of targets) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await autoScroll(page);
    // freeze animations
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(500);
    const file = `${OUT}/${t.name}-${vp.tag}.png`;
    await page.screenshot({ path: file, fullPage: true });
    const dim = await page.evaluate(() => ({ h: document.body.scrollHeight, w: document.body.scrollWidth }));
    console.log(`${file}  (${dim.w}x${dim.h})`);
    await ctx.close();
  }
}
await browser.close();
