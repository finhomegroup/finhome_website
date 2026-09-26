# Retirement plan, reader-first — implementation recap (2026-09-26)

## Independent verification — Codex, 2026-09-26

This section supersedes the implementation-only verification limits below for the checks named here, not for user comprehension or accessibility certification.

- Final `aiws native check finhome-website --mode full` passed in this checkout, 09:43:00–09:44:10 UTC: **304 files / 6739 tests**, TypeScript clean, lint **3 baseline / 0 new**, **282** static pages generated, rendered contracts passed for **76 live / 0 planned** calculators and **196** other pages. Exit 0, output untruncated. This is not a production deployment.
- Independently inspected actual preview UI at **1440×1000** and **390×844**: entry, result, explanatory copy, age-axis chart, legend, compact and full-number mobile table, method and its expanded detail. No page-level horizontal overflow observed in these exercised states. Images were viewed inline in the task, not saved as local screenshot files. After the final three detailed-method copy edits, reloaded the final export and opened/read that disclosure at the normal **868 px** window width; no overflow observed there either.
- Default numeric UI: first shortage at **82**, **3 years** short, annual spending gap **20,942,597 VND**, retirement capital in today's money **4,089,679,933 VND**. Changing current capital to **600,000,000 VND** updates both prose and figures: **83**, **2 years**, **9,443,642 VND**, **4,346,577,745 VND**. Formatting while entering money remains active.
- Exercised funded state (600m current capital, 120m annual spending), zero and negative inflation explanations, and other-income-funded state. Clearing current age with keyboard Backspace clears prior results and contextual verdict; the CTA focuses the invalid input; restoring 35 restores the result. An earlier browser `fill("")` attempt did not clear the field, so it was not treated as invalid-state proof.
- Followed the contribution-tool link after changing inputs: destination returns to its 500m default and displays the explicit re-entry warning. No transfer/persistence is claimed or implemented. Restored the retirement page to its default scenario and reset the viewport override.
- Rechecked unchanged SHA-256 for the financial modules: `retirement.ts` `c5a6368d7fca3d7432b5168b4fee829d47797defcc140d2406c098024804d33d`; `long-term-plan.ts` `f5ace609e0ef76a5467841570afa8e7eb7da989bec7920ccb9360927f6e75044`; `number.ts` `57038d64375a5258e1ce97e391f1e6218fd1ec8b3882d8c9ad0650abedbf3cb7`. Protected header/logo files have no scoped diff. Prior number-formatting edits and unrelated untracked work were preserved.
- Limits: no beginner usability study, no physical-device/screen-reader/true-zoom certification, no whole-site content re-audit, no measured acquisition impact. A readable layout and green tests are not proof that real users understand the content.
- No commit, push, PR or deployment performed. The existing loopback-only preview on port 3236 is intentionally retained for user review. This recap and the review/repair notes are intentionally retained; no material files were deleted.

Implements the user-approved review
`artifacts/finhome-retirement-content-review-2026-09-26.md` on
`/cong-cu/ke-hoach-huu-tri/`, the shared retirement input help and the four-view
navigation. Copy, presentation and one chart adapter only. **No engine, formula,
default input or parser changed.** Codex owns the full gate and every browser
check; nothing below is a claim about appearance.

## Scope

| Area | Files | What changed |
|---|---|---|
| Page copy | `content/calculators/retirement-plan.ts`, `app/cong-cu/ke-hoach-huu-tri/page.tsx` | Plain-Vietnamese title, lede and opening notice (no eleven-digit amounts above the form); result labels; templates for a contextual verdict; three-layer method (`formula.body` + `formula.detail`); FAQ reworded, one item added on what the annual shortfall is not, one on re-entering inputs. |
| Result presentation | `components/retirement-plan-calculator.tsx` | Fills the verdict sentences from `resolveLongTermPlan` — the reader's ages, the engine's depletion age, years short, the depletion year's partial payment; funded and pension-funded states; the shortfall's meaning; the reader's own rates as the assumptions; purchasing power with rounded figures behind a labelled disclosure after the result. |
| Shared inputs | `content/calculators/long-term-plan.ts` | Every field help teaches by example (5 triệu/tháng = 60 triệu/năm; 60 triệu +5% = 63 triệu; 8% turns 100 triệu into 108 triệu, before tax and fees and only if achieved). The longevity sentence is replaced by advice to plan for a longer life. |
| Four-view nav | `content/calculators/long-term-plan.ts` (`views.intro`), sibling FAQs in `retirement-target.ts`, `retirement-income.ts`, `retirement-savings-analysis.ts` | Says the four pages share one formula AND that entered figures are not carried over — the reader re-enters them. No persistence, URL state or handoff was built. |
| Chart | `lib/calc/charts/long-term-chart.ts`, `lib/calc/charts/value-paths-chart.ts` (`xTickLabel`), `lib/calc/charts/labels.ts` (`compactMoneyPair`) | Trajectory axis ticks read as AGES (drawn coordinate unchanged); caption rounded ("khoảng 10,9 tỷ" / "khoảng 4,1 tỷ") with an exact fallback when rounding would make two different amounts look equal; caption names the starting age and capital. Table and markers unchanged in data. |
| Shell | `components/calc/calculator-page.tsx` | Optional `prose.detail` — the disclosed method layer, rendered plain. Additive; no other route passes it. |

## Financial semantics preserved

- `spendingShortfall` is still the **annual spending gap in today's money**. The copy now says
  explicitly that it is not an extra contribution and not a total capital shortage, and points
  to `tinh-huu-tri` for the contribution.
- The funded verdict is still `fundedAtBoundary`; the forgiven residue is still stated.
  Depletion sentences render only when the policy says the plan is short.
- `fundedByOtherIncome` gets its own sentence and is never described as a funded portfolio.
- Contributions are still annual, added once at the start of the year. The monthly examples in
  the helps are arithmetic to reach the annual figure, and `formula.detail` keeps the timing
  qualification.
- Rounded prose uses the existing `compactMoney`; every exact đồng figure remains in the result
  rows, the detail ledger and the figure's table.
- Every default quoted in prose is re-derived from the engine in
  `content/calculators/long-term-plan.test.ts`; every filled sentence is compared with the live
  plan in `components/retirement-plan-render.test.ts`.

## Deliberate departures from earlier contracts

- The length caps on this route's copy (lede < 110, verdict notices < 180, notice ≤ 300) were
  retired by the user's decision; the tests that held them now assert the semantic content
  instead (ages named, conditions beside the conclusion, method disclosed).
- UX doc §5 recorded `realNotice` keeping the exact nominal/real pair above the form. The pair
  now appears under the result, filled from the live plan, and the notice keeps the limitation
  in words. `long-term-plan.test.ts` asserts the opening carries no seven-digit-plus amount.

## Test evidence (this session)

- `tsc --noEmit`: exit 0.
- `pnpm check:lint`: 3 baseline, 0 new.
- Focused suites (retirement render/content tests for all four routes, chart adapter,
  value-paths, labels, views, plan-disposition, tool-shell): all passing.
- Full `vitest run` after the first pass: 304 files, 6728 tests passing. Not re-run after the
  repair pass below, by instruction; the repair touched copy, one component branch and tests.

## Repair pass (same day, second round)

From `artifacts/finhome-retirement-reader-first-repair-2026-09-26.md`. Wording and
financial-semantics fixes only; no engine, default, formula, geometry or number moved, and
`long-term-plan.test.ts` now pins the default scenario's figures to prove it.

| # | Finding | Repair | Regression assertion |
|---|---|---|---|
| 1 | "đến hết tuổi {endAge}" claims the age-85 year; the engine stops at `endAge − 1`. | Funded headline and chart caption say "đến tuổi {endAge}"; the funded body names the last counted year (`{lastAge}`); the end-age help, FAQ and detailed method explain that 85 covers spending until the reader turns 85. | render test "says the plan lasts TO the end age"; content test "counts the years until the reader TURNS the end age". |
| 2 | Depletion-year figures are the portfolio's draw after other income, not household spending; "không còn tiền để chi" overstated. | Partial/none sentences, the detail labels and the figure's partial note all say "khoản dành dụm" and mention other income. | render test "names the PORTFOLIO's draw"; existing exact-figure pins. |
| 3 | Static copy asserted prices rise and nominal is larger; 0%/negative inflation and retiring today are valid. | `realNotice`, chart assumption and `readingNote` teach conditionally ("Khi giá cả tăng…", "với lạm phát 0% hai đường trùng nhau"); the specific claim stays in the dynamic branch, which gained `purchasingPowerToday` for immediate retirement. | render tests at 0% inflation and on the retire-today fixture. |
| 4 | Shared nav intro counted "ba trang còn lại" and listed the trajectory's siblings on all four routes. | Intro is view-independent; the current page is marked by the control; the re-entry warning stays. | views test on all four views: intro rendered, no sibling label, one current marker. |
| 5 | Detailed method said monthly contributions are always behind a January deposit. | Qualified by the sign of the return: behind when positive, equal at 0%, reversed when negative. Annual model unchanged. | content test "qualifies the monthly-versus-yearly timing". |
| 6 | Defensive phrasing in the withdrawal-rate FAQ; "thường thuận lợi hơn thực tế"; "con số bạn sẽ thấy trên sổ tiết kiệm". | The ratio is explained by what it measures and why it alone cannot settle safety; results "có thể cao hơn hoặc thấp hơn"; nominal described as the year's own money "nếu các giả định đúng". | content test "describes assumptions plainly". |
| 7 | Chart assumption "cuối năm đó" read one year late against the age labels. | "mỗi mốc tuổi sau là số tiền vào lúc bạn vừa tròn tuổi đó, tức sau khi đã tính xong năm trước". Data and markers untouched. | render test "explains an age label as the balance on REACHING that age". |

Checks after the repair: `tsc --noEmit` exit 0; `pnpm check:lint` 3 baseline / 0 new; the
focused suites above plus `lib/calc/retirement.test.ts` and `lib/calc/long-term-plan.test.ts`
passing. Still nothing visual, no build, no `check:markup`.

## Third round: three sentences in the detailed method

After the independent full gate (304 files / 6738 tests) and the UI pass at 1440×1000 and
390×844 both passed, three universal comparisons remained in `formula.detail.body` and were
replaced by statements of what the model does:

- **Withdrawal order.** "Chỉ thứ tự thứ hai là lựa chọn thận trọng" was removed; it does not
  hold at a non-positive return. The paragraph now says: withdraw first, then credit the
  assumed return on what remains, and only remaining capital earns it.
- **Indexing the spend.** The "đủ 30 năm rồi cạn ở năm thứ 20" illustration was removed;
  nothing computed it. The paragraph says what the conversion accomplishes: each year's draw
  keeps the purchasing power the reader entered, so the nominal draw grows with the assumed
  inflation.
- **Annuity formula.** The claim that the end-period formula "phóng đại … theo (1 + lợi suất
  thực)" and depletes "sớm hai năm" was removed. The paragraph keeps the real-return formula,
  says the annuity-due timing matches the start-of-year withdrawal, and that other income is
  added.

No code, default or figure changed. Pinned by "states the implemented order and formula
without universal comparisons" in `content/calculators/long-term-plan.test.ts`. Checks run
for this round: that content test, the retirement render test and `tsc --noEmit` only.

## Not verified here

- Anything visual: the age tick labels at 390 px, the length of the result column, the
  disclosure summaries, contrast. `next build` and `check:markup` were not run in this session.
- Whether a real beginner can retell the result. Tests check structure and figure agreement,
  not comprehension.
- The start of the plan is named in the caption, the first tick and the first table row; no
  marker line is drawn at period 0 because it would sit on the y-axis. A design call for the
  browser pass to confirm.
