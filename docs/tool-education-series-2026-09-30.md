# Tool education series — delivery map and recap (2026-09-30)

## Independent final journey review — Codex

Observed on the built local export, not inferred from tests:
- All ten article CTAs navigate to their corresponding tool. All ten tools expose the correct article return link, labelled as opening a new tab. The compound link was clicked: a separate article tab opened and the original tool retained the entered 9 million contribution.
- Six new articles: covers and diagrams load; inspected mobile headers, CTAs and covers at 390×844; no horizontal page overflow. Laptop L 1440×900 navigation and page widths checked. The delivery grid fits both viewports, shows eleven distinct package images (ten new plus car), and exposes PNG/HTML/caption/article/tool links.
- Compound: 8→9 million monthly produces 1,656,853,795; undo returns 1,492,974,448. Timeline starts at its endpoint; beginning→next reaches year 1, about 204.9 million. The exercise was repaired to match this observed sequence.
- Retirement: +12 million/year changes depletion age 75→84; restore then suggested 27.6 million/year funds through age 85; undo returns age 75.
- Deposit: default early month 9 interest 750,000 versus 20,625,000 for the same elapsed period; trial month 12 gives 27,500,000 with no difference; undo available and exercised.
- Percent: selecting the instructed rate-comparison mode gives 7→9, 2 points and 28.57%; trial gives 7→10, 3 points and 42.86%; undo exercised.
- Discount: second-discount trial gives 680,000; after undo, tax-excluded trial gives 777,600; undo restores the original example.
- Margin: cost +10% yields cost 660,000, profit 340,000 and margin 34%; undo exercised. Switching to markup and entering 40 gives price 840,000, profit 240,000 and margin 28.57%.

All ten poster renders (1080×1350), six covers (1200×630), and six diagrams (960×510) were visually inspected with brand fonts loaded. Distinct source IDs and actual PNG signatures/dimensions are additionally checked by tests. The four reused articles' full numerical exercises were not re-entered in this final browser pass; their links were exercised and numerical regression suites cover their declared examples. Existing generic tool privacy wording was observed but is not newly certified by this release; this series makes no blanket telemetry/privacy guarantee.

Local proof captures and compact journey records: `/tmp/finhome-series-LnCuMx/previews/`; final capture inputs: `/tmp/finhome-series-LnCuMx/final-captures/`. These temporary review files are retained for re-export/debugging and are not production dependencies. At this recorded point publication remains pending; the final native gate, PR checks and production smoke are separate release evidence.

Owner: Claude Code (implementation). Codex: independent source/numeric/editorial
review, browser interaction, PNG export, final native gate, release.
Branch `aiws/auto-education-20260930` (Codex switched from
`feat/tool-education-series-20260930` after verifying identical base trees and
merged origin/main with no file changes; all work preserved), base `6e16023`.
Not committed, pushed or published by Claude. Research/preflight evidence (Codex, preserved
unchanged): `docs/tool-education-series-research-2026-09-30.md`.

Data of record: `content/tool-education-series.ts` (ten entries, `PENDING_EXPORTS`).
Tests of record: `content/tool-education-series.test.ts`.

## Decisions

- **New guides use each tool's own shipped default as the example.** "Tính với số
  của tôi" then opens the tool on exactly the article's figures, so no URL state,
  named example or storage was added. Reused articles keep their declared
  household; their existing exercises already give re-entry instructions.
- **Reuse over near-duplicates** for C01–C04 (research doc). Their reviewed text,
  visuals and early tool box are unchanged; no second header button was added
  to them (the existing early box "Mở công cụ …" already sits under the short
  answer — a second green button would duplicate it).
- **Tool → article** reuses existing mechanisms: `TOOL_NEXT_STEPS.education`
  (new-tab `EducationLink` via `ToolNextSteps`) where the tool has next steps;
  a direct `EducationLink` in `afterCalculator` for the three that do not.
- **Visuals**: new guides embed a diagram exported from their poster HTML
  (`?flow`), as the car guide did; covers from `?cover`.
- **People-first social (user rule, 2026-09-30, supersedes the first design)**:
  every poster hero is a real photo of people whose source metadata identifies
  them as Asian; the 3D-illustration and number-only heroes were removed (this
  also removed the review-1 overlap of “28% ≠ 30%” on the discount poster).
  Figures stay in the poster body and the `?flow` diagram. Rule persisted in
  `.cursor/skills/seo-blog/SKILL.md` → "Social imagery".

## People photos (Pexels, license https://www.pexels.com/license/ checked 30/09/2026)

| Pexels ID | Photographer | Source (metadata names Asian subjects) | Project file (unmodified) | Used for |
|---|---|---|---|---|
| 7417519 | cottonbro studio | https://www.pexels.com/photo/a-couple-having-a-conversation-while-sitting-on-a-couch-7417519/ | `public/images/people/pexels-7417519-original.jpg` 6450×4300 | kha-nang-mua-nha — both faces; the only MIRRORED crop (no readable text), so both faces sit right of the wash |
| 7671364 | Ivan S | https://www.pexels.com/photo/man-and-a-woman-sitting-on-sofa-while-looking-at-the-screen-of-a-laptop-7671364/ | `public/images/people/pexels-7671364-original.jpg` 6720×4480 | vay-mua-nha — two people at a laptop |
| 8297072 | Mikhail Nilov | https://www.pexels.com/photo/a-woman-using-calculator-8297072/ | `public/images/people/pexels-8297072-original.jpg` 6000×4000 | lai-suat-tha-noi — calculator and papers; caption says the photo implies no debt or distress |
| 7490459 | Kampus Production | https://www.pexels.com/photo/a-man-using-a-laptop-7490459/ | `public/images/people/pexels-7490459-original.jpg` 6016×4016 | lai-kep — laptop planning |
| 6545334 | Tima Miroshnichenko | https://www.pexels.com/photo/a-woman-using-her-laptop-6545334/ | `public/images/people/pexels-6545334-original.jpg` 2477×3715 | tien-gui-co-ky-han — quiet home scene with teaware shelves (laptop and tea tray fall outside the crop) |
| 5154348 | Budgeron Bach | https://www.pexels.com/photo/concentrated-asian-woman-using-laptop-and-writing-in-notebook-5154348/ | `public/images/people/pexels-5154348-original.jpg` 2624×3936 | muc-tieu-tiet-kiem — face and shoulders (the notebook is below the landscape crop; alt says only what is in frame) |
| 6538435 | cottonbro studio | https://www.pexels.com/photo/a-woman-sitting-at-the-table-6538435/ | `public/images/people/pexels-6538435-original.jpg` 3837×5756 | tinh-phan-tram — at a desk with pen |
| 7937885 | Rhea Jabagat | https://www.pexels.com/photo/an-elderly-couple-smiling-at-the-camera-7937885/ | `public/images/people/pexels-7937885-original.jpg` 3456×5184 | ke-hoach-huu-tri — CSS box shows source y≈889–2852 only (faces/shoulders); the shirt print (top y≈2943) is never visible, proven from CSS offsets in test |
| 5710149 | Sam Lion | https://www.pexels.com/photo/positive-asian-woman-choosing-goods-in-vintage-boutique-5710149/ | `public/images/people/pexels-5710149-original.jpg` 3744×5616 | giam-gia-va-thue — face and notebook |
| 5410107 | Amina Filkins | https://www.pexels.com/photo/cheerful-asian-woman-working-in-floral-shop-5410107/ | `public/images/people/pexels-5410107-original.jpg` 6000×4000 | margin-va-markup — face, hands, notebook; captions say figures are not her business data |

**Diversity correction (user, 2026-09-30):** one photo reused in seven posts was
rejected. The ten packages now use ten DIFFERENT source IDs, none of them the
released car package's 7593053 (car package and homepage untouched). Seven new
originals were sourced and visually inspected by Codex; source metadata names
Asian subjects; licence checked 2026-09-30. Crops recomputed per photo for both
the 680×445 poster box and the 790×520 cover box (faces right of the wash's
transparent edge, 62% of the hero width); the old mirrored-couple values were not reused.
Rule persisted in the seo-blog skill as the "different source photograph"
invariant, with its guarantees, non-guarantees and human authority.

Excluded: 6818113 (user), AI25.Studio 8374288/8374269 (account labels them AI
generative), and 7593053 for this series (car package). No AI person is used. Every poster shows “Ảnh minh họa: <name> /
Pexels” and “Người trong ảnh không đại diện ví dụ”; captions carry photographer,
source, license, check date, file, no-endorsement note; each new guide carries a
cover credit line. Crops are per photo (`--w/--x/--y` poster, `--cw/--cx/--cy`
cover), no retouching; 7937885 and the two shop photos are not flipped.

Source photos are copied UNMODIFIED into `public/images/people/` and cropped
only by CSS. (History: an earlier `sips` gate blocked derivatives; the user
later approved `sips` for this series, used only for the JPEG → PNG export
conversion below. The source photos were deliberately left untouched after
capture, so no optimised derivatives exist.)
- No engine, default, dependency, analytics, persistence or network change.

## Delivery map

| Tool | Canonical article | Kind | Social package |
|---|---|---|---|
| ke-hoach-huu-tri | `/blog/de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi/` | new | `/social/ke-hoach-huu-tri/` |
| lai-kep | `/blog/lai-kep-bao-nhieu-la-tien-ban-tu-gop/` | new | `/social/lai-kep/` |
| muc-tieu-tiet-kiem | `/blog/du-tien-tra-truoc-sau-3-nam/` (C04) | reuse | `/social/muc-tieu-tiet-kiem/` |
| tien-gui-co-ky-han | `/blog/can-tien-truoc-dao-han-mat-bao-nhieu-lai/` | new | `/social/tien-gui-co-ky-han/` |
| kha-nang-mua-nha | `/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/` (C01) | reuse | `/social/kha-nang-mua-nha/` |
| vay-mua-nha | `/blog/vay-2-ty-moi-thang-tra-bao-nhieu/` (C02) | reuse | `/social/vay-mua-nha/` |
| lai-suat-tha-noi | `/blog/het-uu-dai-khoan-tra-tang-bao-nhieu/` (C03) | reuse | `/social/lai-suat-tha-noi/` |
| tinh-phan-tram | `/blog/lai-tu-7-len-9-tang-2-hay-28-phan-tram/` | new | `/social/tinh-phan-tram/` |
| giam-gia-va-thue | `/blog/giam-20-roi-giam-10-co-phai-giam-30/` | new | `/social/giam-gia-va-thue/` |
| margin-va-markup | `/blog/cong-40-vao-gia-von-co-phai-lai-40/` | new | `/social/margin-va-markup/` |

Delivery index: `/social/index.html` (these ten plus `/social/vay-mua-xe/`; noindex,
not a product hub). Guides appear on `/blog/` under "Tính thử trước khi quyết định".

## Examples, results and exercises (all engine-checked in tests)

| Tool | Declared example | Key results | Exact UI exercise |
|---|---|---|---|
| ke-hoach-huu-tri | Tool defaults: 35→60→85; 100m; 15m/năm +6%; 6,5%/4,5%; lạm phát 4,5%; chi 8m, thu nhập khác 4m/tháng (example, not BHXH entitlement) | 2.194.741.612 ₫ nominal ≈ 730.257.686 ₫ today; need 1.200.000.000 ₫; first draw 144.260.854 ₫ (= 48m today); cạn 75, thiếu 10 năm; ~60% | "1 bát = 1 năm nghỉ hưu"; "+12 triệu/năm" → cạn 84, thiếu 1; "−12 triệu/năm"; "Mục tiêu hưu trí" → "Thử mức này" (27.600.000 → đủ) → "Hoàn tác lần thử"; "+1 tuổi" (76/9), "−1 triệu/tháng" (80/5) |
| lai-kep | Tool defaults: 100m + 8m/tháng cuối kỳ, 6%/năm ghép tháng, 10 năm | 1.492.974.448 ₫ = 1.060.000.000 contributed + 432.974.448 interest (29%); year 5: 693.045.259 / 113.045.259; 9m/tháng: 1.656.853.795 ₫ | "Xem kết quả"; "Xem tiền lớn lên qua các mốc thời gian" → "Sau ›"; "Gửi thêm 1 triệu mỗi tháng" → "Hoàn tác lần thử"; rate 0 |
| muc-tieu-tiet-kiem | C04 (unchanged): 100m → 500m, 36 tháng, 6%/12, góp cuối tháng | 9.668.775 ₫/tháng; 0%: 11.111.111 ₫; own 448.075.899 / interest 51.924.101 ₫ | Article's existing exercise |
| tien-gui-co-ky-han | Tool defaults (term mode): 500m, 5,5%, 12 tháng, cuối kỳ, 1 kỳ, 0,2% đang dở, rút tháng 9 | Hold: 27.500.000 ₫. Break 9: 750.000 ₫ vs 20.625.000 ₫ → 19.875.000 ₫ less (not a principal penalty) | "Xem kết quả"; "Tiền có sẵn khi bạn cần không?" → "Rút khi hết kế hoạch (tháng 12)" (0 loss) → "Hoàn tác lần thử" → "Rút trước đáo hạn đầu 1 tháng (tháng 11)". Note: with one cycle the tool does NOT render "Rút đúng đáo hạn đầu" — pinned in test |
| kha-nang-mua-nha | C01 (unchanged) | 13m/tháng repayment; price 1.939.806.716; loan 1.498.000.918 | Article's existing exercise |
| vay-mua-nha | C02 (unchanged) | 17.356.465 scheduled; 19.356.465 cash; month 187; −555.699.884 ₫ interest before fees | Article's existing exercise |
| lai-suat-tha-noi | C03 (unchanged) | 16.111.864 → 20.479.346 from month 13; 2.479.346 over 18m budget | Article's existing exercise |
| tinh-phan-tram | "So hai mức lãi suất" defaults 7 → 9 (tool opens on "Phần trăm của một số") | 2 điểm phần trăm; tăng 28,57%; trial → 10: 3 điểm, 42,86% | Select "So hai mức lãi suất"; "Xem kết quả"; "Nhìn phép tính trên một thước" → "Tăng lãi suất sau thêm 1 điểm" → "Hoàn tác" |
| giam-gia-va-thue | Tool defaults: 1.000.000 ₫ đã gồm thuế, 20% rồi 10%, voucher 0, thuế 8% (prefill, invoice governs) | 800.000 → 720.000 ₫ (28%, not 30%); tax inside 53.333 ₫, net 666.667; "chưa gồm thuế" → 777.600 ₫; lần 2 = 15% → 680.000 ₫ (32%) | "Xem kết quả"; "Đường đi của giá, từng bước" → "Giảm lần 2 thêm 5 điểm" → "Hoàn tác"; "Đổi cách đọc thuế trên giá niêm yết" → "Hoàn tác" |
| margin-va-markup | Tool defaults: mode "Giá vốn và giá bán", 600.000 / 1.000.000 | profit 400.000; margin 40%; markup 66,67%; markup 40% → 840.000, profit 240.000, margin 28,57%; "Tăng giá vốn 10%" → 660.000, 340.000, 34%, 51,52% | "Xem kết quả"; "Cùng một khoản lãi, hai mẫu số" → "Tăng giá vốn 10%" → "Hoàn tác"; "Giá vốn và markup mong muốn" = 40; "Giá vốn và margin mong muốn" = 40 |

Each new guide: early CTA (header button + body link) and ending CTA "Tính với số
của tôi" to the unchanged tool route; declared fictional example; exact result
table with rounded prose; flow diagram; interpretation; one experiment with the
exact shipped labels; reflection question; limits beside claims; sources;
AI-assisted provenance. Guides also cross-link where useful (percent → C03,
compound → savings goal, percent → vay-mua-nha).

## Files

- Articles: `content/posts/{de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi,lai-kep-bao-nhieu-la-tien-ban-tu-gop,can-tien-truoc-dao-han-mat-bao-nhieu-lai,lai-tu-7-len-9-tang-2-hay-28-phan-tram,giam-20-roi-giam-10-co-phai-giam-30,cong-40-vao-gia-von-co-phai-lai-40}.md`;
  entries in `content/posts.ts` (kind `guide`, `headerCta`, pending cover path).
- Tool links: `content/calculators/next-steps.ts` (lai-kep and tinh-phan-tram
  re-pointed to their own guides; tien-gui-co-ky-han added); `guideLink` in
  `retirement-plan.ts`, `price-adjust.ts`, `margin.ts`; `EducationLink` in
  `app/cong-cu/{ke-hoach-huu-tri,giam-gia-va-thue,margin-va-markup}/page.tsx`.
- Social: `public/social/poster.css`, `public/social/poster.js`,
  `public/social/<tool>/{index.html,caption.md}` × 10, `public/social/index.html`.
- Tests: new `content/tool-education-series.test.ts`; `next-steps.test.ts`
  education-seam rule extended (a guide target must be a POSTS guide whose
  Markdown links back to the tool — same two-way rule as the collection);
  `auto-education.test.ts` header-CTA invariant generalised to "every guide, and
  only guides". No test weakened.

## Review-1 repairs (independent editorial feedback)

1. Percent guide no longer says both readings “có thể đúng”; states 2 điểm phần
   trăm vs ~28,57% relative, and that “tăng 2%” is not correct. Rounded-table
   captions no longer claim exactness (percent and margin). Percent FB caption aligned.
2. Retirement: “+1 tuổi” is described literally (one more saving year, one fewer
   drawing year, end age 85 fixed); 75→76 is stated as this example's result.
3. Deposit source → https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-34-vbhn-nhnn-42871/52043.htm,
   with the explicit note that the full updated text was not re-read.
4. Guides now say only “Phép tính chạy ngay trên trình duyệt; công cụ không tự lưu
   lại kế hoạch khi tải lại trang.” — no claim about data never being sent (the
   site loads Google Analytics; not audited here). The released car guide keeps
   its original sentence (out of scope; flag for Codex/editor).
5. `auto-education.test.ts` test title now matches its broader assertion.
6. Discount poster overlap removed with the number-only hero; all heroes now
   share one lead-left / photo-right layout. Cover inspection still required.

## Verification actually run (Claude Code, Node v24.21.0)

- `vitest run`: 358 files / 7.924 tests passed (series test 29/29).
- `tsc --noEmit`: clean. `pnpm check:lint`: 3 baseline, 0 new.
- `next build`: succeeded. `pnpm check:markup`: all rendered contracts hold
  (76 calculator + 223 other pages). Built guide spot-check: title, canonical,
  Article JSON-LD, header CTA; tool pages ship the new-tab article link.
- (At that point: no browser, visual inspection or PNG export yet — all since done; see "Exports".)
- After the people-first update and review-1 repairs (branch
  `aiws/auto-education-20260930`, Node v24.21.0): `vitest run` 358 files /
  7.933 tests passed (series test 38, incl. photo files, crop geometry, credits,
  exclusions, repairs); `tsc` clean; `check:lint` 0 new; `next build` ok;
  `check:markup` all contracts hold. Still no browser/visual check by Claude.
- Diversity repair + visual-review-2 (Node v24.21.0): `vitest run` 358 files /
  7.936 tests passed (series test 41: ten distinct source IDs disjoint from the
  car's; only 7417519 mirrored; faces clear of the wash in poster and cover from
  CSS offsets; lai-kep `?flow` keeps 100:960:433 widths with the narrow segment
  unlabelled and all parts named in a legend); `tsc` clean; `check:lint` 0 new.
  Build/`check:markup` not re-run this pass (HTML under `public/` and Markdown
  only; the brief did not require it). Visual acceptance remains Codex's.
- Export integration (Node v24.21.0): 22 PNGs converted and header-verified;
  focused `tool-education-series` + `auto-education` 53/53 passed; results of
  the final run in this pass are listed in the handoff message. No browser, no
  build by Claude.

## Visual-review-2 repair

`/social/lai-kep/?flow`: the in-bar "100tr" label clipped at the narrow first
segment. The segment keeps its true proportional width and carries no text;
a colour-keyed legend under the bar names "Ban đầu 100 triệu", "Gửi thêm
960 triệu (120 tháng)" and "Lãi giả định ≈433 triệu". Needs re-inspection at 960×510.

## Exports — done 2026-09-30

**Codex proof (independent, in-app browser):** all ten distinct-photo posters at
1080×1350, the six new covers at 1200×630 and the six diagrams at 960×510 were
inspected with brand fonts loaded — faces, text and credits fit; the lai-kep bar
label fix was observed. Codex saved the 22 captures as browser JPEGs.

**Provenance of the PNGs.** Claude converted each capture with
`sips -s format png <capture>.jpg --out <target>.png` (user-approved local
processing, this series only) — a container conversion with NO rescaling and
no further recompression. A PNG made from a JPEG capture is not a lossless
browser capture and recovers no detail; the editable HTML package remains the
authoritative source for any re-export. Captures were checked at their target
sizes before conversion. The released car assets were not touched.

| Files | Signature | Pixel size |
|---|---|---|
| `public/social/<tool>/poster.png` × 10 | `89504e470d0a1a0a` | 1080 × 1350 |
| `public/images/blog/<article>-cover.png` × 6 | `89504e470d0a1a0a` | 1200 × 630 |
| `public/images/blog/<article>-flow.png` × 6 | `89504e470d0a1a0a` | 960 × 510 |

`PENDING_EXPORTS` is now `[]`; a release test asserts it stays empty and that all
22 declared files exist, and the existing test checks each file's signature and
exact size. Source diversity: ten packages, ten distinct Pexels IDs, none equal
to the car's 7593053 (asserted).

**Delivery index.** `/social/index.html` is now a compact responsive thumbnail
grid (auto-fill ≥220 px; two columns under 520 px) of all eleven packages,
including the released car: poster preview, "Tải PNG" download, editable HTML,
caption, article, tool and photo credit. "PNG sẵn sàng tải" appears only for files
that exist (tested). Noindex, original logo/fonts, no scripts or external
resources; states that nothing has been posted to a social account.

## Independent verification (Codex) and last repair

**Native full gate, before the repair below (Codex):** `vitest run` 358 files /
7.938 tests passed; `tsc` clean; `check:lint` 0 new beyond the 3 baseline;
`next build` passed; `check:markup` all contracts hold.

**Browser (Codex, built site):** all 10 posters, 6 covers and 6 flows fit; the
`/social/` grid fits at Laptop L 1440×900 and mobile 390×844; on `/cong-cu/lai-kep/`
the trial 8 → 9 triệu/tháng gives 1.656.853.795 ₫ and undo restores
1.492.974.448 ₫; the article link opens in a new tab and the tool keeps 9 triệu.
Other journey checks are still in progress — not claimed as done.

**Repair from that browser pass (Claude):** the lai-kep timeline opens at its
end point (year 10), where "Sau ›" (accessible name "Xem mốc sau") is disabled,
so the guide's exercise told readers to press a disabled button. Step 2 now says
to press "« Đầu" (accessible name "Về lúc bắt đầu") first, then "Sau ›" — the
browser-verified sequence that reaches year 1 at about 204,9 triệu. A focused
test pins the order and checks 204,9 triệu against the engine. Calculator,
poster HTML and PNGs unchanged. The seo-blog "Social imagery" heading no longer
carries an incident date. Only focused tests were run after this repair
(3 files / 79 tests passed); no build.

## Pending — Codex

1. Independent user-journey checks (poster → article → tool → article new tab)
   and a look at the delivery grid at desktop and mobile widths.
2. Independent editorial/source check, especially: retirement sequence/longevity
   wording; deposit legal citations (the guide makes no specific legal claim);
   VAT 8% statement mirrors the tool's sourced copy. The released car guide still
   carries its original "không gửi" sentence (editor decision).
3. Final native full gate.

## Known limits

- The four reused articles keep their 2026-09-14 text and screenshots; no new
  approval is implied. Their examples differ from tool defaults (truthful
  re-entry instructions already in each exercise).
- `tinh-phan-tram` opens on "Phần trăm của một số"; the guide tells the reader to
  select "So hai mức lãi suất" (defaults 7/9 are then on screen).
- Retirement lever order ("tăng để dành có tác động lớn nhất") is stated for this
  example only.
