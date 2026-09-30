# Tool education series — research and editorial boundaries

Research owner: Codex. Date: 2026-09-30. Status: source-supported concepts and
proposed coverage, NOT completed articles or verified financial fixtures.
Implementation owner: Claude Code; independent runtime verification: Codex.

## Approved outcome

User requested the same complete package as the released car-loan guide for all ten
other tools with interactive visual explanations. Include canonical article (reuse
where appropriate), meaningful visuals, branded HTML/PNG poster, Facebook/LinkedIn
captions, connected article/tool journey, and verified website release. Posting on
social accounts is excluded. No formula, default, dependency, retention or analytics
change is needed to deliver this editorial outcome.

Source baseline: website origin/main `6e16023`, fetched 2026-09-30. Existing reference:
`docs/auto-loan-education-2026-09-30.md`, `public/social/vay-mua-xe/`.

## Coverage and proposed canonical reuse

| Tool slug | Reader question | Existing article candidate / disposition |
|---|---|---|
| ke-hoach-huu-tri | Will the money set aside cover retirement spending? | New guide; use actual bowls visual and labelled hypothetical defaults. |
| lai-kep | How much comes from contributions versus interest? | New guide; show contributed principal separately from modeled return. |
| muc-tieu-tiet-kiem | How much must I put aside to reach a dated goal? | Reuse `du-tien-tra-truoc-sau-3-nam`; reconcile its exercise with the current tool modes. |
| tien-gui-co-ky-han | Will my deposit mature before I need the money? | New guide; separate maturity, reinvestment and early access. |
| kha-nang-mua-nha | What home budget fits the money left each month? | Reuse `co-600-trieu-nen-tim-nha-tam-gia-nao`; no approval/available-house claim. |
| vay-mua-nha | What must the household pay, beyond the monthly loan amount? | Reuse `vay-2-ty-moi-thang-tra-bao-nhieu`. |
| lai-suat-tha-noi | Can the household still pay after the introductory rate ends? | Reuse `het-uu-dai-khoan-tra-tang-bao-nhieu`. |
| tinh-phan-tram | What does a percentage use as its starting amount? | New guide; distinguish percent from percentage points. |
| giam-gia-va-thue | Does 20% then 10% off mean 30% off? | New guide; distinguish tax-included price from an additional tax charge. |
| margin-va-markup | Does adding 40% to cost mean 40% of sales is profit? | New guide; gross margin, not take-home profit. |

The four reuse mappings were resolved against the structured article data on
2026-09-30: C01/C03 are in `content/education/approved-tool-guides.ts`, C02/C04 in
`content/education/articles-1.ts`. This is not evidence of new publication.

## Sources independently read via web retrieval

Use short original explanations; don't transplant foreign law or copy foreign examples.
The example numbers should come from FinHome's engine and actual interface.

- [Investor.gov: Small savings add up](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/small-savings-add-big-money)
  — explains interest earned on prior interest. Supports the concept only, not a
  Vietnamese product yield or a guaranteed investment path.
- [Investor.gov: compound interest calculator](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator)
  — exposes initial amount, recurring contribution, horizon, assumed rate and
  compounding frequency. Good reference for explicit assumptions, not a replacement
  for the FinHome engine's timing convention.
- [Investor.gov: risk and return](https://www.investor.gov/additional-resources/information/youth/teachers-classroom-resources/risk-and-return)
  — inflation can erode purchasing power. Do not import its US deposit-insurance claims.
- [MoneyHelper: How much money do I need for retirement?](https://www.moneyhelper.org.uk/en/pensions-and-retirement/building-your-retirement-pot/how-long-might-your-money-need-to-last-in-retirement?source=mas)
  — plan the duration, spending and income, then compare the gap and vary contributions
  or retirement timing. UK pension ages, benefits and tax rules are out of scope.
- [CFPB: decide how much to spend on a home](https://www.consumerfinance.gov/owning-a-home/prepare/decide-how-much-you-want-spend/)
  — monthly borrowing capacity depends on available repayment cash, upfront cash,
  interest and terms; ownership costs extend beyond principal and interest. No US
  underwriting ratios or mortgage-insurance thresholds are recommended for Vietnam.
- [CFPB: fixed versus adjustable rate](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-rate-and-adjustable-rate-mortgage-arm-loan-en-100/)
  — rates/payments can change; refinancing or selling before an increase cannot be
  assumed. FinHome scenarios must not imply a prediction of the next reset rate.
- [CFPB: index and margin](https://www.consumerfinance.gov/ask-cfpb/for-an-adjustable-rate-mortgage-arm-what-are-the-index-and-margin-and-how-do-they-work-en-1949/)
  — a conceptual explanation of reference rate plus contractual spread. Actual
  Vietnamese contracts determine reference, reset dates, floors and other conditions.
- [business.gov.au: financial terms](https://business.gov.au/finance/financial-tools-and-templates/key-financial-terms)
  — distinguishes gross profit and net profit. Use elementary own arithmetic to
  explain the different denominators of margin and markup; don't copy awkward definitions.
- [OpenStax: percent applications](https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent)
  and [discount applications](https://openstax.org/books/prealgebra-2e/pages/6-3-solve-sales-tax-commission-and-discount-applications)
  — percentage amount = rate times base; a discount reduces the current applicable
  price. Use original VND examples and no copied diagrams or exercise prose.

## Vietnam-specific source caution

The [Government's 2022 explanation](https://baochinhphu.vn/quy-dinh-moi-ve-lai-suat-rut-truoc-han-tien-gui-10222062114522068.htm)
distinguishes full and partial early withdrawal. It is historical; the existing tool
correctly points to later consolidated **34/VBHN-NHNN (2024)** and amendment
47/2024/TT-NHNN. Do NOT present 04/2022 as unchanged current law. Official text located:
[consolidated circular](https://congbao.chinhphu.vn/tai-ve-van-ban-so-34-vbhn-nhnn-42871-52043?format=pdf).
The search excerpt confirms the amendment; its complete provisions still need a direct
read if the new article makes a specific legal claim. Prefer explaining the tool's
declared simulation and asking readers to check their agreement.

Existing price-adjust content cites Nghị định 174/2025/NĐ-CP with categories and an
expiry; [official signed PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/174nd.signed.pdf)
was located but not yet fully reread here. An example's 8% is a declared input, not a
universal VAT statement. Do not broaden the article to tax advice.

## Specific verification traps

- Retirement: 8m desired monthly spend and 4m other income are separate. Only the
  remaining 4m is drawn from savings. Distinguish today's purchasing power from
  future nominal balance; distinguish annual contributions from monthly spending.
  The visible 27.6m/year suggestion rounds up an underlying modeled threshold.
- Savings: monthly contributions can be made at different times; declare the actual
  engine convention. Preserve existing three-year article data rather than secretly
  comparing it to a five-year default.
- Deposit: simple interest within a term versus compounding across renewed terms;
  actual-day/365 view is different from months/12 view. Separate interest foregone
  during elapsed time from interest on future days never held. No automatic US-style
  early-withdrawal fee claim in the Vietnam article.
- Percentage: 7% to 9% is +2 percentage points, not +2% relative change.
- Discount: 1m with sequential 20% then 10% discounts yields 720k, not 700k.
  If the original price includes tax, don't add that tax again.
- Margin: cost600k, price1m => gross difference400k, margin40%, markup66.67%.
  Adding40% to600k yields840k and margin28.57%, before other operating expenses.
- Exact article/poster results, screenshots and exercise states must match. Illustration
  assets alone do not prove a calculated scenario or a working handoff.

## Current limits

Read-only source research and coverage planning completed. No new article, image export,
browser journey acceptance or website release is claimed by this document. Claude's first
handoff attempt could not read its temporary brief due to its working-directory permission;
the scope-specific permission question has been sent to the user.

## Independent pre-implementation verification — 2026-09-30 21:04 +07

On unchanged source base `6e16023`, Node24.21.0, the focused suites
`approved-tool-guides.test.ts`, `financial-semantics.test.ts`, and `articles.test.ts`
passed: **3 files / 183 tests**, exit0. The tests exercise existing article contracts;
they do not prove new series implementation, final imagery or live user journeys.

Resolved reuse examples, to prevent accidental substitution with tool defaults:

| Article | Declared scenario and expected result | Evidence |
|---|---|---|
| C01 affordability | Gross45m, net40m, essentials17m, debt3m, reserve contribution5m, other housing2m; savings600m with100m held back; rate8.5%,240mo,cost3%,LTV80%,ratios40%/50%. Repayment13m; price1,939,806,716; loan1,498,000,918. | `APPROVED_C01.visual.input`; executed engine assertions in approved-tool-guides test. |
| C02 mortgage | Loan2bn,8.5% fixed,240mo,annuity,+2m extra principal/month. Scheduled17,356,465; cash19,356,465; final9,549,208 in month187; interest reduction555,699,884 before fees. | Article visual/household; independent annuity calculation and month-by-month principal recurrence in Node24 reproduce all rounded results. |
| C03 floating | Loan2bn,240mo,first12mo7.5%,then11%,budget18m. First16,111,864; reset20,479,346; excess2,479,346 from month13. | `APPROVED_C03.visual`; executed engine assertions in approved-tool-guides test. |
| C04 saving | Initial100m,target500m,36mo,6% nominal/year divided by12,contribution at month end. Required9,668,775/mo; own capital448,075,899; interest51,924,101. At0%,required11,111,111/mo (rounded display). | Article visual/household; independent geometric-series annuity calculation in Node24 agrees. |

Rounding matters: displayed required contributions are rounded for explanation, not a
guarantee that repeating that integer amount produces the exact target. Use the engine's
unrounded value for comparisons and respect the tool's own rounding behavior.

Source refresh result: the official34/VBHN landing page was read; its linked CDN PDF
returned502, so complete legal provisions remain unverified in this pass. The VAT PDF
was reachable as a56-page scan, but no whole-document legal validation is claimed.

Retain current article URLs and preserve their declared household unless a deliberate
editorial correction is justified. Their old screenshots are labelled23/09/2026;
newly exported posters must not be presented as new UI screenshots without fresh capture.
Update changed articles' review/provenance date without retroactively claiming the
founder approved new text just because the existing source says the older text was approved.
