import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:8899/index.html', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: (el.textContent || '').trim().slice(0, 40),
      tag: el.tagName.toLowerCase(),
      fontFamily: cs.fontFamily.split(',')[0],
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage.slice(0, 80),
      padding: cs.padding,
      borderRadius: cs.borderRadius,
      border: cs.border,
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const out = {};

  // Buttons "Thử ngay"
  const btns = [...document.querySelectorAll('a,button')].filter((n) => (n.textContent || '').trim() === 'Thử ngay');
  out.buttons = btns.map(pick);

  // Headings by font-size (largest text nodes)
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,p,span')]
    .map((n) => ({ n, fs: parseFloat(getComputedStyle(n).fontSize), t: (n.textContent || '').trim() }))
    .filter((x) => x.t.length > 4 && x.fs >= 20)
    .sort((a, b) => b.fs - a.fs);
  const seen = new Set();
  out.headings = [];
  for (const x of heads) {
    const key = x.t.slice(0, 20);
    if (seen.has(key)) continue;
    seen.add(key);
    out.headings.push(pick(x.n));
    if (out.headings.length >= 8) break;
  }

  // Eyebrow / small labels
  const findText = (txt) => [...document.querySelectorAll('h1,h2,h3,p,span,div')].find((n) => (n.textContent || '').trim() === txt);
  out.eyebrowFinHome = pick(findText('FinHome'));
  out.bodyParagraph = pick([...document.querySelectorAll('p')].find((p) => (p.textContent || '').length > 60));

  // Section vertical paddings: top-level children of main content
  out.bgBody = getComputedStyle(document.body).backgroundColor;
  return out;
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
