import pw from '/Users/minhle/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;

const SITES = [
  ['framer', 'http://localhost:8899/index.html'],
  ['next', 'http://localhost:3000/'],
];

// Text probes: find visible element whose text includes `t`, pick the largest font-size candidate.
const TEXT = [
  ['nav.Tính năng', 'Tính năng'],
  ['cta.Thử ngay', 'Thử ngay'],
  ['hero.eyebrow', 'FinHome', 'eyebrowPill'],
  ['hero.h1', 'FinHome giúp bạn chọn'],
  ['steps.h2', 'Các bước đơn giản'],
  ['steps.cardTitle', 'Khởi động bằng dữ liệu'],
  ['steps.cardItemTitle', 'Xác định vùng mua nhà'],
  ['platform.h2', 'Một nền tảng đồng hành'],
  ['platform.cardTitle', 'Cá nhân hóa trải nghiệm'],
  ['testi.h2', 'Trải nghiệm từ người dùng'],
  ['testi.sub', 'Góc nhìn từ người dùng'],
  ['testi.name', 'Anh Phạm'],
  ['faq.h2', 'câu hỏi thường gặp'],
  ['faq.q1', 'FinHome là gì và giúp'],
  ['news.h2', 'Tin tức bất động sản'],
];

// Image probes by filename fragment
const IMGS = [
  ['logo.header', 'y9hwKK'],
  ['hero.bg', 'hInhX'],
  ['hero.phone', '2rgZQ'],
  ['hero.qrbadge', 'o8jJX'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const out = {};
for (const [tag, url] of SITES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await p.evaluate(async () => { await new Promise(r => { let t = 0; const i = setInterval(() => { scrollBy(0, 700); t += 700; if (t > document.body.scrollHeight + 1000) { clearInterval(i); scrollTo(0, 0); r(); } }, 40); }); });
  await p.waitForTimeout(700);

  const data = await p.evaluate(({ TEXT, IMGS }) => {
    const rnd = (n) => Math.round(n);
    const styleOf = (el) => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return {
        fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing,
        color: cs.color, align: cs.textAlign, ff: cs.fontFamily.split(',')[0].replace(/"/g, ''),
        w: rnd(r.width), h: rnd(r.height), top: rnd(r.top + scrollY), left: rnd(r.left),
      };
    };
    const bestText = (sub, mode) => {
      let cands = [...document.querySelectorAll('h1,h2,h3,h4,p,span,a,div,button,li')]
        .filter(n => { const t = (n.textContent || '').trim(); return t.includes(sub) && t.length < sub.length + 80; });
      if (!cands.length) return null;
      if (mode === 'eyebrowPill') {
        // smallest box containing exactly "FinHome" near top (the pill), not the h1/logo
        cands = cands.filter(n => (n.textContent || '').trim() === 'FinHome' && (n.getBoundingClientRect().top + scrollY) < 700 && (n.getBoundingClientRect().top + scrollY) > 60);
        cands.sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width);
        return cands[0] ? styleOf(cands[0]) : null;
      }
      // pick the largest font-size candidate (the visible heading/text)
      cands.sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize));
      return styleOf(cands[0]);
    };
    const climbPill = (sub) => {
      const leaf = [...document.querySelectorAll('*')].find(n => (n.textContent || '').trim() === sub && n.children.length <= 1);
      if (!leaf) return null;
      let el = leaf;
      for (let i = 0; i < 6 && el; i++) { if ((parseFloat(getComputedStyle(el).borderRadius) || 0) > 10) break; el = el.parentElement; }
      if (!el) return null;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return { w: rnd(r.width), h: rnd(r.height), top: rnd(r.top + scrollY), radius: cs.borderRadius, pad: cs.padding, bg: cs.backgroundColor, fs: getComputedStyle(leaf).fontSize };
    };
    const imgOf = (frag) => {
      const im = [...document.querySelectorAll('img')].find(n => (n.currentSrc || n.src).includes(frag));
      if (!im) return null; const r = im.getBoundingClientRect(); const cs = getComputedStyle(im);
      return { w: rnd(r.width), h: rnd(r.height), top: rnd(r.top + scrollY), left: rnd(r.left), right: rnd(r.right), fit: cs.objectFit, natural: im.naturalWidth + 'x' + im.naturalHeight };
    };

    const res = { text: {}, img: {}, special: {} };
    for (const [key, sub, mode] of TEXT) res.text[key] = bestText(sub, mode);
    for (const [key, frag] of IMGS) res.img[key] = imgOf(frag);

    // header capsule: climb from logo
    const logo = [...document.querySelectorAll('img')].find(n => (n.currentSrc || n.src).includes('y9hwKK'));
    if (logo) {
      let el = logo.parentElement;
      for (let i = 0; i < 6 && el; i++) { const r = el.getBoundingClientRect(); if (r.height >= 40 && r.height <= 90 && r.width > 600) { res.special.headerBar = { w: rnd(r.width), h: rnd(r.height), top: rnd(r.top + scrollY), left: rnd(r.left), radius: getComputedStyle(el).borderRadius, bg: getComputedStyle(el).backgroundColor }; break; } el = el.parentElement; }
    }
    res.special.ctaPill = climbPill('Thử ngay');

    // section tops (for spacing) — find heading anchors and climb to section
    const secTop = (sub) => {
      const el = [...document.querySelectorAll('h1,h2,h3,p,span,div')].find(n => { const t = (n.textContent || '').trim(); return t.includes(sub) && t.length < sub.length + 60; });
      if (!el) return null; let s = el;
      for (let i = 0; i < 8 && s.parentElement; i++) { const r = s.parentElement.getBoundingClientRect(); if (r.height > 320) { s = s.parentElement; break; } s = s.parentElement; }
      return rnd(s.getBoundingClientRect().top + scrollY);
    };
    res.special.sections = {
      steps: secTop('Các bước đơn giản'),
      platform: secTop('Một nền tảng đồng hành'),
      testi: secTop('Trải nghiệm từ người dùng'),
      faq: secTop('câu hỏi thường gặp'),
      news: secTop('Tin tức bất động sản'),
      pageH: document.body.scrollHeight,
    };
    return res;
  }, { TEXT, IMGS });

  out[tag] = data;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
