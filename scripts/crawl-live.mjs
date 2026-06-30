// Comprehensive crawl of the LIVE Framer site: home + every internal page.
// Renders each page, scrolls to trigger lazy content, and dumps structured
// text + image/link inventory to /tmp/finhome-crawl/*.json.
// Usage: node scripts/crawl-live.mjs
import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const ORIGIN = 'https://finhomegroup.framer.website';
const START = ORIGIN + '/';
const OUT = '/tmp/finhome-crawl';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });

async function crawl(url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 2400 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(async () => {
    await new Promise((r) => { let t = 0; const i = setInterval(() => { scrollBy(0, 600); t += 600; if (t > document.body.scrollHeight + 2000) { clearInterval(i); scrollTo(0, 0); r(); } }, 40); });
  });
  await p.waitForTimeout(1500);

  const data = await p.evaluate((origin) => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const baseOf = (src) => { try { return decodeURIComponent(new URL(src).pathname.split('/').pop()); } catch { return ''; } };

    // ordered visible text (leaf-ish: text not duplicated by a single child)
    const texts = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,li,blockquote')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const t = clean(el.textContent);
      if (!t || t.length > 1200) continue;
      if ([...el.children].some((c) => clean(c.textContent) === t)) continue;
      const key = el.tagName + '|' + Math.round(r.top + scrollY) + '|' + t;
      if (seen.has(key)) continue;
      seen.add(key);
      const cs = getComputedStyle(el);
      texts.push({ tag: el.tagName, top: Math.round(r.top + scrollY), left: Math.round(r.left), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, text: t });
    }
    texts.sort((a, b) => a.top - b.top || a.left - b.left);

    // images (dedup by base+top)
    const imgSeen = new Set();
    const imgs = [];
    for (const im of document.querySelectorAll('img')) {
      const src = im.currentSrc || im.src; if (!src) continue;
      const r = im.getBoundingClientRect();
      const base = baseOf(src);
      const key = base + '|' + Math.round(r.top + scrollY);
      if (imgSeen.has(key)) continue; imgSeen.add(key);
      imgs.push({ base, alt: im.alt || '', w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY), natural: im.naturalWidth + 'x' + im.naturalHeight });
    }

    // links (internal + external)
    const linkSeen = new Set();
    const links = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.href; const text = clean(a.textContent);
      const key = href + '|' + text.slice(0, 30);
      if (linkSeen.has(key)) continue; linkSeen.add(key);
      links.push({ href, text: text.slice(0, 80), internal: href.startsWith(origin) });
    }

    return { title: document.title, texts, imgs, links, pageHeight: document.body.scrollHeight };
  }, ORIGIN);

  await ctx.close();
  return { url, ...data };
}

// 1) home
const home = await crawl(START);
fs.writeFileSync(`${OUT}/home.json`, JSON.stringify(home, null, 1));
console.log('home crawled:', home.texts.length, 'texts,', home.imgs.length, 'imgs,', home.links.length, 'links');

// 2) discover internal pages (exclude pure anchors and the home itself)
const internal = [...new Set(home.links.filter((l) => l.internal).map((l) => l.href.split('#')[0]))]
  .filter((u) => u !== START && u !== ORIGIN && u !== ORIGIN + '/');
console.log('internal pages:', internal.length);
console.log(internal.join('\n'));

const index = { home: home.url, pages: [] };
for (const u of internal) {
  try {
    const d = await crawl(u);
    const slug = u.replace(ORIGIN, '').replace(/\/+$/, '').replace(/^\//, '').replace(/\//g, '__') || 'root';
    fs.writeFileSync(`${OUT}/page-${slug}.json`, JSON.stringify(d, null, 1));
    index.pages.push({ url: u, slug, file: `page-${slug}.json`, texts: d.texts.length, imgs: d.imgs.length });
    console.log('  page:', u, '->', d.texts.length, 'texts');
  } catch (e) {
    console.log('  FAILED:', u, e.message);
  }
}
fs.writeFileSync(`${OUT}/index.json`, JSON.stringify(index, null, 1));
await browser.close();
console.log('DONE. Artifacts in', OUT);
