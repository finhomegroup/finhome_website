import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pw;

const OUT = '/tmp/finhome-shots';
fs.mkdirSync(OUT, { recursive: true });

// Anchor texts present in BOTH builds (section landmarks)
const ANCHORS = [
  { key: 'hero', text: 'FinHome giúp bạn chọn' },
  { key: 'steps', text: 'Các bước đơn giản' },
  { key: 'platform', text: 'Một nền tảng đồng hành' },
  { key: 'testimonials', text: 'Trải nghiệm từ người dùng' },
  { key: 'faq', text: 'câu hỏi thường gặp' },
  { key: 'news', text: 'Tin tức bất động sản' },
];

const SITES = [
  { name: 'framer', url: 'http://localhost:8899/index.html' },
  { name: 'next', url: 'http://localhost:3000/' },
];

async function run(site) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(site.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  // trigger reveals by scrolling, then force visible (for next's framer-motion)
  await page.evaluate(async () => {
    await new Promise((r) => { let t=0; const i=setInterval(()=>{window.scrollBy(0,600);t+=600;if(t>=document.body.scrollHeight+1500){clearInterval(i);window.scrollTo(0,0);r();}},50); });
  });
  await page.waitForTimeout(800);

  const data = {};
  for (const a of ANCHORS) {
    const info = await page.evaluate((text) => {
      const all = [...document.querySelectorAll('h1,h2,h3,p,span,div')];
      const el = all.find((n) => {
        const t = (n.textContent || '').trim();
        return t.includes(text) && t.length < text.length + 60;
      });
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      // climb to a section-ish ancestor for region bounds
      let sec = el;
      for (let i = 0; i < 6 && sec.parentElement; i++) {
        const pr = sec.parentElement.getBoundingClientRect();
        if (pr.height > 300) { sec = sec.parentElement; break; }
        sec = sec.parentElement;
      }
      const sr = sec.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 50),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        textAlign: cs.textAlign,
        headingTop: Math.round(top),
        sectionTop: Math.round(sr.top + window.scrollY),
        sectionHeight: Math.round(sr.height),
      };
    }, a.text);
    data[a.key] = info;
  }
  data.__pageHeight = await page.evaluate(() => document.body.scrollHeight);

  // section crops based on heading tops (gap between consecutive anchors)
  const order = ANCHORS.map((a) => a.key).filter((k) => data[k]);
  await page.addStyleTag({ content: '*{opacity:1!important}' });
  await page.waitForTimeout(300);
  // resize viewport to full height so clip regions are within the viewport
  await page.setViewportSize({ width: 1440, height: Math.min(16000, data.__pageHeight) });
  await page.waitForTimeout(300);
  for (let i = 0; i < order.length; i++) {
    const k = order[i];
    const start = Math.max(0, (i === 0 ? 0 : data[k].sectionTop) - 10);
    const end = i + 1 < order.length ? data[order[i + 1]].sectionTop : data.__pageHeight;
    const h = Math.min(4000, Math.max(100, end - start));
    await page.screenshot({
      path: `${OUT}/sec-${k}-${site.name}.png`,
      clip: { x: 0, y: start, width: 1440, height: h },
    });
  }
  await ctx.close();
  return data;
}

const browser = await chromium.launch({ channel: 'chrome' });
const out = {};
for (const s of SITES) out[s.name] = await run(s);
await browser.close();
fs.writeFileSync(`${OUT}/measurements.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
