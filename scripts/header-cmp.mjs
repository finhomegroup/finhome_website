import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const OUT = '/tmp/finhome-header';
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  { name: 'framer', url: 'http://localhost:8899/index.html' },
  { name: 'next', url: 'http://localhost:3000/' },
];

function pick(el) {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').trim().slice(0, 40),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    letterSpacing: cs.letterSpacing,
    color: cs.color,
    bg: cs.backgroundColor,
    borderRadius: cs.borderRadius,
    boxShadow: cs.boxShadow,
    padding: cs.padding,
    gap: cs.gap || cs.columnGap,
    backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
  };
}

async function run(site) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(site.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    const header = document.querySelector('header') || document.querySelector('nav');
    const cs = header ? getComputedStyle(header) : null;
    const hr = header ? header.getBoundingClientRect() : null;
    // the visible "pill" bar: first child div with rounded bg, or the nav row
    return { headerTag: header?.tagName, headerHeight: hr ? Math.round(hr.height) : null, headerPos: cs?.position };
  });

  // screenshot top region (header zone) at 1440 wide
  await page.screenshot({ path: `${OUT}/header-${site.name}.png`, clip: { x: 0, y: 0, width: 1440, height: 120 } });

  // dump full styles map
  const detail = await page.evaluate(() => {
    function pickFn(el) {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: el.className?.toString?.().slice(0, 80),
        text: (el.textContent || '').trim().slice(0, 40),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing, color: cs.color, bg: cs.backgroundColor,
        borderRadius: cs.borderRadius, boxShadow: cs.boxShadow, padding: cs.padding,
        gap: cs.gap || cs.columnGap,
        backdropFilter: cs.backdropFilter || getComputedStyle(el).webkitBackdropFilter,
      };
    }
    const header = document.querySelector('header') || document.querySelector('nav');
    if (!header) return { error: 'no header' };
    // find the pill bar = the descendant with a non-transparent bg + border-radius
    const all = [...header.querySelectorAll('*')];
    const pill = all.find((el) => {
      const cs = getComputedStyle(el);
      const br = parseFloat(cs.borderRadius);
      const bg = cs.backgroundColor;
      return br > 10 && bg !== 'rgba(0, 0, 0, 0)' && el.getBoundingClientRect().height > 30;
    });
    const logo = header.querySelector('img');
    const links = [...header.querySelectorAll('a')].filter((a) => (a.textContent || '').trim().length > 0 && !a.querySelector('img'));
    const cta = links.find((a) => /thử|ngay|tải|đăng/i.test(a.textContent || '')) || links[links.length - 1];
    const navLinks = links.filter((a) => a !== cta);
    return {
      header: pickFn(header),
      pill: pickFn(pill),
      logo: pickFn(logo),
      navLinks: navLinks.map(pickFn),
      cta: pickFn(cta),
    };
  });

  await ctx.close();
  return { ...data, detail };
}

const browser = await chromium.launch({ channel: 'chrome' });
const out = {};
for (const s of SITES) out[s.name] = await run(s);
await browser.close();
fs.writeFileSync(`${OUT}/header.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
