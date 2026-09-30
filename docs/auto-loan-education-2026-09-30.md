# Auto-loan education delivery — 2026-09-30

## Outcome and scope

Original Vietnamese guide for a household balancing a first car, everyday cash flow
and longer-term goals such as a home deposit. Delivery: published blog, explanatory
visual, owned cover illustration, 1080 × 1350 HTML/PNG poster, social captions and alt
text. Social account posting is not included. User explicitly authorized direct Codex
implementation after Claude Code stopped at its session limit; no Claude review claim.

Article: `/blog/vay-mua-xe-con-du-bao-nhieu/`.
Social package: `/social/vay-mua-xe/index.html`, `poster.png`, `caption.md`.
HTML references project-local logo, fonts and the licensed hero photo by relative paths.
Serve with the website's public directory (or preserve those relative assets); it is not
a single-file offline bundle. PNG is ready to upload without those dependencies.

## Research and reader-first choices

Primary sources read 2026-09-30:

- CFPB, [compare auto loans beyond monthly payment](https://www.consumerfinance.gov/ask-cfpb/how-do-i-compare-auto-loan-offers-what-should-i-look-at-besides-the-monthly-payment-en-753/): compare amount, term and total cost, not instalment alone.
- FTC, [Financing or Leasing a Car](https://consumer.ftc.gov/articles/financing-or-leasing-car), dated July 2022: written total vehicle price, financing terms, and the risk of owing more than the car is worth. Concepts only; US law and product practices are not applied to Vietnam.
- TikTok, [Next 2026](https://ads.tiktok.com/business/en-GB/next): its forecast emphasizes grounded stories and curiosity-driven discovery. We apply a concrete everyday hook, visible arithmetic and a question to try. This is platform research, not proof this topic is trending among Vietnamese FinHome customers or that the content will convert.

Project `seo-blog` shaped the sequence: household question → declared example →
money-flow image and exact table → interpretation → one controlled experiment.
Simple adult language; no viral promise, current-rate claim or borrowing recommendation.
Poster shares the same household. Savings are already deducted before the 501,182 ₫
residual. Upfront cash and lost alternative uses stay separate from monthly allocation.
No account-specific user data was used.

## Actual tool review

Production `/cong-cu/vay-mua-xe/` observed in browser. Existing form, result CTA,
living infographic, monthly budget and debt schedule are implemented. No financial
formula was changed. (Superseded in part: the journey work below changed the tool's
entry and links, not its arithmetic.)

Inputs: on-road price 700m; down payment 300m; trade-in zero; rate 10% fixed; 60 months;
net household income 40m; essentials 22m excluding debt/vehicle; other debt 3m;
regular savings 3m; vehicle running costs 3m. All fictional, not market averages.

Observed live: 8,498,818 ₫ monthly payment; 109,929,073 ₫ total interest; 501,182 ₫
left after all entered allocations. Changing term input to 84 months produced
6,640,474 ₫ monthly payment and 157,799,783 ₫ interest. Reverted to 60 months.
The trial shortcut button was not successfully exercised; the comparison was verified
by editing the term field directly. Do not claim a complete calculator E2E audit.

The tool starts with its own example (including trade-in and zero running costs).
Originally the article told readers to retype the fields; since the journey work below,
“Thử đúng ví dụ này” opens the article's household through a public named example.
Payment uses existing `computeAutoLoan`; household allocation uses existing
`compareVehicleBudget`. Article tests compare all exact quoted results to those engines.
No independent certification of bank schedules, rates or financial suitability.

## Content architecture

`kind: guide` reuses the Markdown article route and sitemap. It is excluded from news
filters/API and from the home-only “Mua nhà bằng con số” structured collection.
One small section on `/blog/` makes guides discoverable; no new hub, dependency,
calculator layout or marketing funnel. Related articles stay within their kind.

## Verification / release

- Focused numerical, taxonomy, asset and internal-link tests: passed (3 tests).
- Poster visually inspected at 1080 × 1350; cover at 1200 × 630.
- Laptop L article: 1440 × 900; cover/chart loaded, no horizontal document overflow.
- Mobile article: 390 × 844, no document overflow; budget/comparison tables both
  fit the 350px content width. Monetary columns keep currency with the number.
- Full gate and release checks are recorded below when completed.

Brand revision: original `public/logos/logo-finhome-group.svg`, unchanged; original
Maison Neue Extended Book/Medium font files from `app/fonts.css`, Inter fallback;
brand-green-ink `#117f36` and bg-soft `#f7fcf7`. No recreated wordmark or invented font.
Poster, cover and chart are HTML/CSS compositions rendered through the browser; all
three exports have their actual PNG signature and pixel dimensions checked in tests.

Photo: Miriam Alonso, [Pexels 7593053](https://www.pexels.com/photo/man-and-woman-sitting-on-a-sofa-7593053/),
reusing the existing unchanged `public/images/home/pexels-7593053-original.jpg` used by
the homepage hero. Photo page and [Pexels License](https://www.pexels.com/license/) read
2026-09-30: free use, with restrictions including no implied endorsement and no offensive
depiction. Image is illustrative, not a customer story or the people in the fictional
financial example; this is labelled in the poster and article. CSS crop/gradient only.
Candidate car-family photo 12573870 was not used because its download returned HTTP 503.
No rights assurance beyond the source's published license is claimed.

Browser render readiness reports MaisonBook/MaisonMedium and Inter loaded, with the
logo and photo decoded. Final output still requires visual inspection; a loaded font
alone does not certify every glyph, license, readability or brand acceptance.

## Article ↔ tool journey — implemented 2026-09-30 (Claude Code)

Source: `artifacts/auto-education/journey-review/README.md` (review of the local build).
Implemented in this worktree only; not committed, pushed, built or published.
Codex owns the independent UI review and the full native gate.

**Article** (`content/posts/vay-mua-xe-con-du-bao-nhieu.md`)
- “Tính với số của tôi” → `/cong-cu/vay-mua-xe/` (default route) after the opening,
  ahead of every other tool link, and again after “Đối chiếu trước khi quyết định”.
- “Thử đúng ví dụ này” → `/cong-cu/vay-mua-xe/#vi-du-bai-vay-mua-xe` right after the
  budget table/figure, and as step 1 of the exercise.
- Exercise now teaches the existing buttons by exact label: “Xem kết quả”,
  “Kéo dài kỳ hạn thêm 2 năm” (5 → 7 năm; trả tháng 8,5 → 6,6 triệu; tổng lãi
  109,9 → 157,8 triệu; còn lại 0,5 → 2,4 triệu), “Hoàn tác lần thử”, then
  “Thêm 1 triệu tiền nuôi xe”. The retype instruction and the “không tự nhận các số”
  note are replaced by a truthful note: fictional figures; asks before replacing typed
  figures; nothing saved or sent.

**Named example** (`components/auto-example.ts`, `AUTO_LOAN.namedExamples`)
- Public ID `vi-du-bai-vay-mua-xe` → price 700m, down 300m, trade-in 0, 10 %, 5 năm,
  net 40m, essentials 22m, other debts 3m, reserve 3m, running 3m. Engine result
  8.498.818 ₫/tháng, residual 501.182 ₫ (tested).
- The fragment is an ID only: exact own keys; anything else (including
  `#…&price=1`, `#constructor`) is ignored. No figure is read from a URL or written to
  one. No storage, network, analytics, dependency or formula change.
- Read with `useSyncExternalStore` (server snapshot `null`), so the static HTML and
  every hash-less visit are the unchanged default example (800m / 300m / trade-in
  100m / running 0 → 3.501.182 ₫). The example is applied after hydration.
- Never overwrites: loads only into an untouched form (all fields at their start
  values, no trial held). Otherwise a static box offers “Thay bằng ví dụ trong bài” /
  “Giữ số đang nhập”. Loaded state shows “Ví dụ trong bài: …” naming the article, with
  a new-tab “Đọc bài” link. “Về ví dụ mẫu” returns to the example the page opened on.
- `useCalcFields` gained an additive `load(values)`; no other calculator uses it.

**Tool page** (`app/cong-cu/vay-mua-xe/page.tsx`, `components/auto-loan-related.tsx`)
- Catalogue link reads “Tất cả công cụ” on this page only, through an opt-in
  `backLabel` on `CalculatorPage`/`CalculatorHeading`; destination `/cong-cu/` and
  accessible name unchanged; all other routes keep “Quay lại”.
- Tool → article: “Xem cách đọc kết quả qua một ví dụ” via the shared `EducationLink`
  (T03), first under “Tiếp theo cho chiếc xe này”.
- Fuel link opens a new tab, labelled “(mở trong tab mới)”, `rel="noopener noreferrer"`;
  the lease link stays in the same tab. This keeps the form in its original tab; it
  does NOT make same-tab Back restore figures (unchanged, not promised).
- Build-time guard: explainer/named-example article must exist in `POSTS` with the
  quoted title, or the route throws.

**Blog index**: the home-collection card is titled “Mua nhà bằng con số”
(`EDUCATION_COLLECTION.name`) instead of “Hướng dẫn dễ hiểu”.

**Social**: `caption.md` main/short captions tightened; fictional household stated
before the figures; “trả đều gốc và lãi” replaced by “mỗi tháng trả cùng một khoản gốc
cộng lãi”. Poster branding and photo unchanged. Repair 2: poster HTML assumption line
now reads “mỗi tháng trả cùng một tổng tiền gốc và lãi” (still four lines; same
assets and CSS). **`poster.png` is NOT re-rendered yet** — Codex re-exports and
inspects it. Cover and flow images unchanged.

**Article header action** (repair 1): opt-in `Post.headerCta`, set only on this
guide, renders the existing `Button` primitive (primary, `lg`) “Tính với số của tôi”
→ `/cong-cu/vay-mua-xe/` after the metadata row and before the cover. No other post
has one (tested by rendering a news and an education article). Body links unchanged.
Whether it lands on the first 1440×900 screen is not yet observed in a browser.

### Verification actually run (Claude Code, 2026-09-30)

- `vitest run` focused: 33 files / 912 tests passed, including new
  `components/auto-example.test.ts` (11) and extended `content/auto-education.test.ts`
  (7). Whole suite afterwards: 355 files / 7.828 tests passed.
- `tsc --noEmit`: clean. `pnpm check:lint`: 3 baseline, 0 new.
- **Node caveat:** the session's permitted `pnpm` ran Node v25.1.0 (engine warning
  `>=24 <25`). Invoking the Node 24.21.0 binary was blocked by the permission layer.
  Re-run under Node 24 before relying on these results.
- NOT run: `next build`, `pnpm check:markup`, `pnpm gate`, any browser check.
- After repairs 1–2: whole suite 357 files / 7.895 tests passed; `tsc` clean;
  `check:lint` 0 new. `pnpm` still resolved Node v25.1.0 in this session.

### Implementation handoff checklist (historical; independent results below)

- Full native gate under Node 24: `pnpm gate`, then confirm `out/blog/<slug>/index.html`
  metadata/JSON-LD and that the built car page has one back link to `/cong-cu/`.
- Browser, at measured viewports (1440×900, 390×844): the named-example load after
  hydration (a brief frame of default numbers is expected, unmeasured); the offer box
  after typing then opening the link in the same tab; the “Ví dụ trong bài” line
  wrapping on mobile; both new-tab links; the term trial and undo on the example; that
  the early CTA is on the first screen. None of these was observed in a browser.
- Known limitation: the tool's static formula prose still describes its own default
  (800 − 300 − 100) while the named example is on screen; labelled “Với mặc định”.
- Once the example is loaded, the default example comes back only by opening the page
  without the fragment; there is no in-page switch back.

## Independent release verification — 2026-09-30

Integrated latest `origin/main` (`459c1fd`, floating-rate learning release) without
changing its files. Codex's full native gate at 12:57:52–12:59:22 UTC ran with Node
24.21.0 and `VITEST_MAX_WORKERS=3`: **357 files / 7,895 tests passed**, TypeScript,
baseline lint (3 existing / 0 new), static build (302 routes), and rendered contracts
(76 calculators / 216 other pages) all passed. No formula or dependency changed.

Actual built-site browser checks on loopback 3251:

- 1440×900: article's header CTA is visible at y=437–477, before the cover; both
  article images load. The contextual link loads the public example after hydration:
  700M / 300M / trade-in 0 / 10% / 5 years / 40M / 22M / 3M / 3M / running 3M.
  Result: 501,182 dong. The initial static frame uses the default before hydration;
  it is not a server-rendered personalised result.
- Trial 5→7 years changes monthly payment to 6,640,474 dong and total interest to
  157,799,783 dong. Undo restores 5 years and 501,182 dong. Adding 1M running cost
  shows a 498,818-dong monthly shortfall; undo restores the example.
- Typed running cost 3.5M remains in the original form after opening fuel in a
  labelled new tab, observing the fuel page, and closing that tab. Explanation link
  opens the correct article in a new tab and also preserves the form.
- Typed price 650M, navigated to an unknown fragment and then the named fragment:
  the offer appears without overwriting 650M. “Giữ số đang nhập” retains it;
  “Thay bằng ví dụ trong bài” explicitly restores the complete example.
- 390×844: article CTA visible at y=381.5–421.5; both tables fit their 335px content
  area; no horizontal document overflow in article or calculator. Named example,
  result, term trial and undo work; result action focuses its result region. No
  errors/warnings recorded in this browser tab. Screenshots in
  `artifacts/auto-education/desktop.jpg`, `mobile.jpg`, and `release/` replace stale
  pre-brand-revision captures; `journey-review/` retains the dated pre-fix audit.
- Poster HTML was re-rendered at 1080×1350 from the built web preview with logo/photo
  decoded and MaisonBook/MaisonMedium/Inter loaded. Final PNG was re-encoded to an
  actual PNG and visually inspected. The clarified annuity wording fits; cover and
  flow artwork are unchanged. The earlier “PNG not re-rendered” note is superseded.

This is browser and automated verification, not user-comprehension research,
physical-device or screen-reader certification, or financial/legal approval.
Facebook publication is intentionally left to the user. Public release verification
must follow successful CI/merge/deployment; local checks do not prove publication.

Final full native gate after the PNG export: **13:04:39–13:06:11 UTC, passed** with
the same 357 files / 7,895 tests and all five steps. Blog index → article → header
CTA was also exercised: it opens the unmodified default route (800M price, running
cost 0, residual 3,501,182 dong), with no named-example badge. Thus the reader's
own-number path and the worked-example path remain distinct. The user still needs
to replace the visibly labelled default example with their own inputs.
