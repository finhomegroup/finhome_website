# Social housing (nhà ở xã hội) track — design

Date: 2026-09-17
Status: approved in chat, not yet implemented

## 1. Why

`nhà ở xã hội` appears in **34 news posts** under `content/posts/` and in **zero**
education articles and **zero** calculators. That is the widest gap in the product
for the audience the education collection names in its own subtitle — "người mua
nhà lần đầu".

The gap is not cosmetic. It is a seam between two halves of the site:

- The **news** half tracks NOXH constantly, including specific projects at
  specific prices (e.g. a 1,1 tỷ project near Vành đai 3).
- The **tools and education** half — where a reader goes to *act* — models a
  commercial loan at 8,5%/năm and nothing else. `2 tỷ` appears **28 times**
  across the 15 articles and `8,5%/năm` **18 times**.

So a reader who learns from a news post that they might afford a NOXH unit has
nowhere on the site to find out whether they qualify, or what it would cost them
at the subsidised rate. The subsidised rate is **5,4%/năm** against the
collection's 8,5% — on a 20-year loan that is not a detail, it is a different
answer.

## 2. Scope

**In:**

1. `lib/calc/social-housing.ts` — a pure module owning the dated statutory
   parameters and the income-ceiling assessment.
2. `/cong-cu/nha-o-xa-hoi/` — a SECOND ROUTE onto the existing affordability
   calculator, opened at the NOXH programme's parameters.
3. One education article in the group **"Xác định ngân sách mua nhà"**.
4. Registry, plan-disposition and citation wiring for the above.

**Out, deliberately:**

- A second affordability engine. The model is already `computeAffordability`;
  NOXH changes three parameter defaults, not the arithmetic. Writing a second
  one would be the "two forms" defect the thirteenth unit's convention forbids.
- A province-by-province rate table. Local `HĐND` resolutions do override the
  national rate (Hà Nội is 4,8%/năm under NQ 56/2025/NQ-HĐND), but that is a
  34-province surface with per-province instruments and expiry dates, and a
  stale row silently misprices a 25-year loan. Rejected until there is a
  maintenance owner. The national rate is the default and the copy names Hà Nội
  as a live example of why the reader must confirm their own province.
- A `nhà ở xã hội` purchase-cost piece, glossary entries, and an article on
  documenting income for informal workers (Thông tư 08/2026 covers the
  confirmation form, and `Công an cấp xã` confirmation with a 7-day statutory
  turnaround is the route for a worker with no labour contract). All three are
  real and all three are separate units.

## 3. The statutory parameters

Every figure below was verified from a government source on 2026-09-17 and is
recorded with its instrument. **None of it came from model memory, and that was
not a precaution — it was necessary:** a from-memory draft of this spec would
have cited 15 triệu/tháng for a single applicant, which is two amendments stale
and would have told qualifying households they do not qualify.

### 3.1 Income ceilings — `khoản 1 Điều 30` NĐ 100/2024, as amended

Measured on **thu nhập bình quân hàng tháng thực nhận** (take-home, not gross),
averaged over the **12 months immediately preceding** the point the competent
authority certifies the file.

| Effective from | Instrument | Single | Married couple, combined | Single parent, minor children |
|---|---|---|---|---|
| 10/10/2025 | NĐ 261/2025/NĐ-CP | 20 triệu | 40 triệu | 30 triệu |
| 07/04/2026 | NĐ 136/2026/NĐ-CP | **25 triệu** | **50 triệu** | **35 triệu** |

Applies to the beneficiaries at points 5, 6 and 8 of `Điều 76 Luật Nhà ở`
(low-income urban residents; workers at enterprises and cooperatives, inside and
outside industrial zones; cán bộ, công chức, viên chức). The 25 triệu figure
applies nationwide.

**Dates before 10/10/2025 return `undefined`.** NĐ 100/2024's original figures
were not verified for this spec, so the module must not guess them. This is
`us-retirement-limits.ts`'s rule #1 applied to a decree-versioned table: an
unknown period returns nothing rather than borrowing a neighbouring period's
ceiling, because a stale ceiling produces a confidently wrong answer for exactly
the readers who sit near it.

### 3.2 Housing condition — `Điều 29` NĐ 100/2024, amended by NĐ 54/2026/NĐ-CP

Either no home owned in the province/city holding the project, **or** an average
floor area below **15 m² sàn/người**, counted across the applicant, spouse,
parents (if any) and children with permanent residence at that home. Also
required: has not previously bought, rented or lease-purchased NOXH, and has not
previously received housing support in any form in that province.

`Nghị quyết 201/2025/QH15` (29/5/2025) additionally provides that someone who
owns a home far from their workplace may still qualify.

**NĐ 54/2026's effective date is NOT verified** and must not be asserted. Cite
the condition as "Điều 29 NĐ 100/2024, sửa đổi bởi NĐ 54/2026/NĐ-CP" with no
date until someone confirms it. This costs nothing here because the housing
condition is documentary and renders as prose, not as a dated computable
threshold.

### 3.3 Loan terms — `khoản 4 Điều 48` NĐ 100/2024, amended by NĐ 261/2025

| Parameter | Value |
|---|---|
| Rate | **5,4%/năm** |
| Overdue rate | 130% of the lending rate |
| Max advance, buy / lease-purchase | **80%** of contract value |
| Max term | **25 năm (300 tháng)** from first disbursement |

NĐ 261/2025 (effective 10/10/2025) set 5,4%; `QĐ 2553/QĐ-TTg` applied the
adjusted NHCSXH policy-programme rates from 01/12/2025. Cite the decree as the
legal basis and the PM decision as the rate-setting act; do not claim one
superseded the other, which was not established.

Two facts worth surfacing to readers:

- **A stated expiry exists.** NĐ 261/2025's `Điều 2` and `khoản 2 Điều 3` run
  until **31/5/2030**. This is the "instrument + expiry" that `check:done`
  section A asks for. NĐ 136/2026 states no expiry, and "no stated expiry" is
  the honest value for it rather than a blank.
- **A transitional right.** Credit contracts signed with NHCSXH *before*
  NĐ 261/2025 took effect may be amended to apply the new rate to outstanding
  principal. A reader already holding an older, dearer NOXH loan may be able to
  move to 5,4%, and no page currently tells them so.

### 3.4 Volatility is a design input, not a footnote

The income ceiling moved **three times in 24 months**:

```
NĐ 100/2024 (26/7/2024) → NĐ 261/2025 (10/10/2025) → NĐ 54/2026 → NĐ 136/2026 (07/04/2026)
```

While researching this, a `luatvietnam.vn` page **titled "Điều kiện mua nhà ở xã
hội 2026"** was still publishing the superseded 20/40/30 figures. Secondary legal
sites disagree with each other and go stale silently. Two consequences bind the
implementation:

1. Cite the **instrument**, never a website, and show the effective date on the
   page so a reader can tell whether what they are reading has been overtaken.
2. Ship the **whole amendment chain**, not just the current row. A reader
   checking a 2025 application needs the figures that applied to them, and a
   table with history makes a missing update visible instead of silent.

## 4. Module design — `lib/calc/social-housing.ts`

Pure: no React, no I/O, no DOM, no `Date`, no `Math.random`. The reference date
arrives from the caller, per the `tinh-ngay` convention ("the reference date comes
in from the client, never `Date`").

```ts
export type NoxhHousehold = "single" | "couple" | "singleParentMinorChildren";

export type NoxhIncomeCeilings = {
  /** ISO date the instrument takes effect. */
  effectiveFrom: string;
  /** e.g. "Nghị định 136/2026/NĐ-CP". */
  instrument: string;
  /** Null when the instrument states no expiry. */
  expiresAfter: string | null;
  ceilings: Record<NoxhHousehold, number>;
};

/** The chain, oldest first. Exported so a page can render the history. */
export const NOXH_INCOME_CEILINGS: NoxhIncomeCeilings[];

/** The row in force at `asOf`, or undefined before the earliest verified row. */
export function noxhCeilingsAt(asOf: string): NoxhIncomeCeilings | undefined;

export type NoxhIncomeAssessment = {
  household: NoxhHousehold;
  /** Take-home monthly income, averaged over 12 months, in đồng. */
  monthlyNetIncome: number;
  ceiling: number;
  /** Strictly the income test. NOT an eligibility verdict. */
  withinCeiling: boolean;
  /** Headroom under the ceiling, or the amount above it. Signed. */
  marginToCeiling: number;
  instrument: string;
  effectiveFrom: string;
};

/** Null when `asOf` predates the earliest verified ceiling row. */
export function assessNoxhIncome(input: {
  household: NoxhHousehold;
  monthlyNetIncome: number;
  asOf: string;
}): NoxhIncomeAssessment | null;

/** Dated loan parameters. */
export const NOXH_LOAN = {
  annualRatePercent: 5.4,
  maxLtvPercent: 80,
  maxTermMonths: 300,
  overdueRateMultiplier: 1.3,
} as const;
```

`withinCeiling` is named for what it measures. It is deliberately **not**
`eligible`: two of the three statutory conditions are documentary and this module
cannot see them, so a field called `eligible` would be a lie at the type level.

## 5. Route design — `/cong-cu/nha-o-xa-hoi/`

Follows the established second-route pattern exactly as
`app/cong-cu/tra-toi-thieu-the-tin-dung/page.tsx` renders
`<CardPayoffCalculator strategy="minimum" />`: its own URL, title, lede, notice,
prose and FAQ, rendering the **same** component at a different opening state. Its
content file carries **no form strings**, so the two routes cannot drift.

`components/affordability-calculator.tsx` gains a `programme` prop:
`"commercial"` (default, current behaviour, byte-identical output) or
`"social-housing"`, which opens at `annualRatePercent: 5.4`,
`assumedMaxLtvPercent: 80`, `termMonths: 300`.

### 5.1 The one semantic trap

`assumedMaxLtvPercent`'s own docstring reads:

> "A user assumption, **not a bank's limit and not a regulation**."

Under NOXH, 80% **is** a regulation. Same field, different epistemic status. §3
of the suite doc records the shared disclaimer being wrong twice in this exact
way — inferring the MODEL from the FORM — so:

- The NOXH route overrides that field's help text to say it is a **statutory
  cap** under `khoản 4 Điều 48`, not the reader's assumption.
- The rate field **keeps** its override affordance and says why: Hà Nội is
  4,8%/năm under `NQ 56/2025/NQ-HĐND`, so the national 5,4% is a default to
  confirm, not a fact about the reader's province.
- The term field states 300 months as the statutory maximum.

## 6. Eligibility is reported, never approved

Three conditions, and only one is arithmetic:

| Condition | Computable here |
|---|---|
| Income vs the dated ceiling | **Yes** |
| No home in that province, or < 15 m²/person | No — documentary |
| No prior NOXH or housing support in that province | No — documentary |

The two documentary conditions render as a stated checklist the reader confirms
themselves, in the same register the affordability article already uses for
"ngân hàng có duyệt cho bạn vay hay không" — an explicit **"Trang này không trả
lời được gì"** block. The page must never present the income test as an
eligibility verdict.

**Being above the ceiling still computes the affordability answer**, with the
breach named and quantified. Withholding it would be wrong for two reasons: a
reader may be checking on behalf of a household whose composition or income will
change, and the ceiling has moved twice in 24 months *in the reader's favour*, so
"above it today" is not "ineligible".

## 7. The article

Group: **"Xác định ngân sách mua nhà"**. It reuses the existing `co-600-trieu`
household rather than inventing a persona — **44 triệu/tháng thực nhận, a
couple** — because that household sits under the 50 triệu couple ceiling. The
comparison is therefore same household, two programmes:

| | Commercial | NOXH |
|---|---|---|
| Rate | 8,5%/năm | 5,4%/năm |
| Max advance | reader's assumption | 80% statutory |
| Max term | reader's choice | 300 months statutory |

This also repairs the collection's narrowness at its root: the flagship article's
household turns out to qualify for a programme the collection never mentioned.

The article must state that qualifying on income is not qualifying, and that unit
supply and project eligibility are neither a calculation nor something this site
knows.

## 8. Registry and disposition impact

- `registry.ts`: one new `live` row, `category: "vay-the-chap"`. Live count
  **75 → 76**.
- `plan-disposition.ts`: one new row at **P1**, no `library` (it is on the
  first-home-buyer path, which is what `library` marks the absence of).
  `PRIORITY_COUNTS.P1` **5 → 6**, total **75 → 76**.
- `plan-disposition.test.ts` asserts both the per-tier counts and their sum, so
  those move in the same commit.
- Because the row has no `library`, `next-steps.ts` **permits** an entry — the
  guard only forbids entries on library-shelved rows. It should get one, pointing
  at `kha-nang-mua-nha` and `muc-tieu-tiet-kiem`.
### 8.1 `planIndex` — append, and restate the comment rather than the test

The new row is **appended to the end of both `CALCULATORS` and
`TOOL_DISPOSITIONS`** with `planIndex: 75`.

What `plan-disposition.test.ts` actually asserts is positional identity between
the two arrays — `indices` equals `[0..n-1]`, and
`TOOL_DISPOSITIONS[i].slug === CALCULATORS[i].slug`. Appending to both satisfies
it unchanged, so **no test is modified to accommodate this.** That matters: a
test edited to let a new row through is how an invariant quietly stops being one.

What *is* now false is the field's own docstring, which says `planIndex` "is the
row number in the audit's `plan-data.mjs`". Index 75 has no audit row. So the
docstring is updated to state that indices 0–74 map to audit rows and indices
≥ 75 are post-audit additions with no audit row, and that the guard is a
positional identity with the registry rather than a mapping into the audit.

Appending rather than inserting next to `kha-nang-mua-nha` is deliberate:
inserting would renumber `planIndex` on roughly sixty following rows, and every
one of those numbers is referenced by unit records in
`docs/finhome-tools-execution-2026-09-14.md` as "original row N". Renumbering
would silently invalidate that whole body of record to gain nothing but
adjacency in one array. The hub groups by `category`, and a filter preserves
array order, so the route appears at the end of the `vay-the-chap` group.

## 9. Testing

Per the recipe in §2 of the suite doc, plus:

- `social-housing.test.ts` — thresholds asserted against the **decrees**, not
  against the implementation; the couple ceiling exceeds the single ceiling in
  every row; ceilings are non-decreasing along the chain; `noxhCeilingsAt`
  returns the 261/2025 row for a date inside 10/10/2025–06/04/2026 and the
  136/2026 row from 07/04/2026; `undefined` before 10/10/2025.
- **A red-green regression on the actual failure mode**: for any date on or after
  07/04/2026, the superseded 20/40/30 figures must be unreachable. Verified to
  fail if the chain's last row is removed.
- A render test that `/cong-cu/nha-o-xa-hoi/` opens at 5,4 / 80 / 300, that its
  LTV help text differs from the commercial route's, and that the page carries
  the instrument and effective date as visible text.
- A test that the income assessment is never rendered with verdict wording — the
  page ships the documentary checklist whenever it shows a `withinCeiling: true`
  result.
- `CalculatorPage`'s `sources` slot carries the decrees as real links, with the
  `intro` stating the provenance limit (this is the case that slot exists for —
  a tool that PREFILLS a legal parameter).

## 10. What this design does not claim

- Not legal advice, and not a professional's sign-off. The same standing caveat
  as row 15's rental-tax model.
- Not an eligibility decision. Two of three conditions are documentary.
- Nothing about **unit supply** — whether a project exists near the reader, is
  legally cleared to sell, or has units left. That is the binding constraint in
  practice and it is not a calculation.
- NĐ 100/2024's original income figures and NĐ 54/2026's effective date are
  **unverified and must not be asserted**; §3.1 and §3.2 say how each is handled.
- No visual claim. Anything rendered must be observed in a browser at a stated,
  measured viewport before it is reported as verified.
