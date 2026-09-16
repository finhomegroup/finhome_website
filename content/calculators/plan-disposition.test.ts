import { describe, it, expect } from "vitest";
import {
  CALCULATORS,
  getCalculator,
  liveCalculators,
} from "@/content/calculators/registry";
import {
  PRIORITY_COUNTS,
  PRIORITY_ORDER,
  READING_DISPOSITIONS,
  READING_WORK_PENDING,
  TOOL_DISPOSITIONS,
  dispositionFor,
  dispositionsByPriority,
  readingDispositionFor,
  readingWorkPending,
  type ToolPriority,
} from "@/content/calculators/plan-disposition";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { AFFORDABILITY } from "@/content/calculators/affordability";
import { APR } from "@/content/calculators/apr";
import { APR_ADVANCED } from "@/content/calculators/apr-advanced";
import { AUTO_LEASE } from "@/content/calculators/auto-lease";
import { BIWEEKLY } from "@/content/calculators/biweekly";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";
import { BOND } from "@/content/calculators/bond";
import { CAPM } from "@/content/calculators/capm";
import { DDM } from "@/content/calculators/ddm";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";
import { FIBONACCI } from "@/content/calculators/fibonacci";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { HOLDING_PERIOD } from "@/content/calculators/holding-period";
import { IRR_NPV } from "@/content/calculators/irr-npv";
import { LOAN } from "@/content/calculators/loan";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { MARGIN } from "@/content/calculators/margin";
import { PIVOT } from "@/content/calculators/pivot";
import { REFINANCE } from "@/content/calculators/refinance";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import { RETIREMENT_PLAN } from "@/content/calculators/retirement-plan";
import { RETIREMENT_TARGET } from "@/content/calculators/retirement-target";
import { RETIREMENT_SAVINGS_ANALYSIS } from "@/content/calculators/retirement-savings-analysis";
import { RETIREMENT_INCOME } from "@/content/calculators/retirement-income";
import { COMMERCIAL_LOAN } from "@/content/calculators/commercial-loan";
import { WACC } from "@/content/calculators/wacc";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";
import { FINANCIAL_RATIOS } from "@/content/calculators/financial-ratios";
import { STATEMENT_ANALYSIS } from "@/content/calculators/statement-analysis";
import { SAVINGS_GOAL } from "@/content/calculators/savings-goal";
import { STOCK_RETURN } from "@/content/calculators/stock-return";
import { TIP } from "@/content/calculators/tip";

/**
 * The "Cách tính" block of every tool this pass made a claim about.
 *
 * Only the `emphasis` rows and the four `direct` ones are here, because those
 * are the two dispositions that assert something checkable about the shipped
 * page. `context` and `reference` rows assert that NOTHING was added, which
 * the coverage test above already records.
 *
 * Ten `emphasis` rows now: plan row 44 joined when the long-term foundation
 * slice localised it. A row filed `emphasis` and absent from this collection
 * is an UNVERIFIED claim, which is why "actually applies emphasis wherever it
 * claims to" fails on a missing entry rather than skipping it.
 */
const CALCULATOR_PROSE: Record<
  string,
  { body: readonly string[]; emphasis?: readonly string[] }
> = {
  "vay-mua-nha": LOAN.formula,
  "so-sanh-khoan-vay": LOAN_COMPARE.formula,
  "kha-nang-mua-nha": AFFORDABILITY.formula,
  "lai-suat-tha-noi": FLOATING_LOAN.formula,
  "muc-tieu-tiet-kiem": SAVINGS_GOAL.formula,
  apr: APR.formula,
  "apr-nang-cao": APR_ADVANCED.formula,
  "thue-hay-mua": RENT_VS_BUY.formula,
  "tai-cap-von": REFINANCE.formula,
  "ke-hoach-huu-tri": RETIREMENT_PLAN.formula,
  "tinh-huu-tri": RETIREMENT_TARGET.formula,
  "phan-tich-tiet-kiem-huu-tri": RETIREMENT_SAVINGS_ANALYSIS.formula,
  "thu-nhap-huu-tri": RETIREMENT_INCOME.formula,
  // The eleven `dau-tu` investing rows, added when that unit flipped them
  // from `reference`. `capm` and `fibonacci` are unquoted keys here for the
  // same reason they are in `READING_DISPOSITIONS`: they are valid
  // identifiers, and the two files should read the same way.
  "irr-npv": IRR_NPV.formula,
  "trai-phieu": BOND.formula,
  "loi-nhuan-co-phieu": STOCK_RETURN.formula,
  "co-phieu-tang-truong-deu": DDM.formula,
  "co-phieu-tang-truong-khong-deu": DDM_MULTI.formula,
  capm: CAPM.formula,
  "loi-nhuan-ky-vong": EXPECTED_RETURN.formula,
  "loi-nhuan-ky-nam-giu": HOLDING_PERIOD.formula,
  "quyen-chon-black-scholes": BLACK_SCHOLES.formula,
  "diem-pivot": PIVOT.formula,
  fibonacci: FIBONACCI.formula,
  "tinh-tien-tip": TIP.formula,
  "margin-va-markup": MARGIN.formula,
  "tra-no-hai-tuan": BIWEEKLY.formula,
  "thue-mua-xe": AUTO_LEASE.formula,
  "vay-thuong-mai": COMMERCIAL_LOAN.formula,
  wacc: WACC.formula,
  "du-bao-kinh-doanh": BUSINESS_FORECAST.formula,
  "cac-chi-so-tai-chinh": FINANCIAL_RATIOS.formula,
  "phan-tich-bao-cao-tai-chinh": STATEMENT_ANALYSIS.formula,
};

/**
 * Whether a row's shipped content carries the one treatment this file VERIFIES.
 *
 * `emphasis` is verifiable because the phrases are data beside the prose and
 * `missingPhrases` can prove they occur; `context` and `reference` assert only
 * that nothing was added. So this is the artefact side of the pending-list
 * check below — the analogue of "does app/cong-cu/[slug]/page.tsx exist".
 */
function shipsVerifiedEmphasis(slug: string): boolean {
  if (readingDispositionFor(slug) !== "emphasis") return false;
  const prose = CALCULATOR_PROSE[slug];
  if (!prose || (prose.emphasis?.length ?? 0) === 0) return false;
  return missingPhrases(prose.body, prose.emphasis ?? []).length === 0;
}

/**
 * Rows where the pending bookkeeping and the shipped treatment disagree.
 *
 * Takes the list as a PARAMETER so the empty case — legitimate, and what the
 * old non-emptiness guard made unreachable — can be exercised without
 * emptying the real one.
 */
function inconsistentPendingRows(
  pending: readonly string[],
): { slug: string; problem: string }[] {
  const isPending = (slug: string) => pending.includes(slug);
  return Object.keys(READING_DISPOSITIONS).flatMap((slug) => {
    const verified = shipsVerifiedEmphasis(slug);
    if (verified && isPending(slug)) {
      return [
        {
          slug,
          problem:
            "ships verified emphasis but is still in READING_WORK_PENDING — " +
            "remove it, or the list understates what has shipped",
        },
      ];
    }
    if (!verified && isPending(slug) && readingDispositionFor(slug) === "emphasis") {
      return [
        {
          slug,
          problem:
            "is pending and claims the verified `emphasis` treatment without " +
            "wiring its prose into CALCULATOR_PROSE — wire it, or file it as " +
            "context/reference until its unit runs",
        },
      ];
    }
    return [];
  });
}

describe("the 75-row plan disposition", () => {
  it("covers every registry entry exactly once", () => {
    // The completion discipline in docs/finhome-tools-execution-2026-09-14.md
    // is "an explicit disposition against each original row". A tool with no
    // disposition is a row nobody decided about, and it would silently vanish
    // from the hub's priority views.
    const registrySlugs = CALCULATORS.map((c) => c.slug);
    const dispositionSlugs = TOOL_DISPOSITIONS.map((d) => d.slug);

    expect(new Set(dispositionSlugs).size).toBe(dispositionSlugs.length);
    for (const slug of registrySlugs) {
      expect(dispositionFor(slug), `no disposition for "${slug}"`).toBeDefined();
    }
    for (const slug of dispositionSlugs) {
      expect(
        getCalculator(slug),
        `disposition for "${slug}" has no registry entry`,
      ).toBeDefined();
    }
    expect(dispositionSlugs.length).toBe(registrySlugs.length);
  });

  it("keeps planIndex in step with the registry order", () => {
    // planIndex is the row number in the audit's plan-data.mjs, which is
    // ordered exactly as CALCULATORS is. Asserting the identity rather than
    // just "0..74 present" means an entry inserted into the registry without
    // re-indexing here is a red test, not a mapping that reads a decision off
    // the wrong row.
    const indices = TOOL_DISPOSITIONS.map((d) => d.planIndex);
    expect(indices).toEqual(indices.map((_, i) => i));
    for (const [i, calc] of CALCULATORS.entries()) {
      expect(
        TOOL_DISPOSITIONS[i].slug,
        `plan row ${i} is "${TOOL_DISPOSITIONS[i].slug}" but registry row ${i} is "${calc.slug}"`,
      ).toBe(calc.slug);
    }
  });

  it("splits into exactly the tiers the plan committed to", () => {
    // 5 / 12 / 22 / 36. The work packages are scoped by these boundaries, so a
    // tool that drifts tier silently moves the scope of a package.
    for (const priority of PRIORITY_ORDER) {
      expect(
        dispositionsByPriority(priority).length,
        `${priority} count`,
      ).toBe(PRIORITY_COUNTS[priority]);
    }
    const total = PRIORITY_ORDER.reduce(
      (sum, p) => sum + PRIORITY_COUNTS[p],
      0,
    );
    expect(total).toBe(TOOL_DISPOSITIONS.length);
  });

  it("gives every entry a priority the hub renders", () => {
    for (const d of TOOL_DISPOSITIONS) {
      expect(PRIORITY_ORDER).toContain(d.priority);
    }
  });

  it("asks a real question on every row", () => {
    // The hub is question-first and its search matches these strings. An
    // empty one is a tool that cannot be found by what a buyer wants to know,
    // and a statement rather than a question means the row was filled in with
    // a title instead of a user need.
    for (const d of TOOL_DISPOSITIONS) {
      expect(d.question.trim().length, d.slug).toBeGreaterThan(10);
      expect(d.question.trim().endsWith("?"), d.slug).toBe(true);
    }
  });

  it("never files a tool on the United States shelf without the US notice", () => {
    // `library: "hoa-ky"` puts a badge on the hub; `usRules` renders the legal
    // notice above the calculator itself. A tool with the badge and no notice
    // would warn the visitor who reads the index and not the one who lands on
    // the page from search.
    for (const d of TOOL_DISPOSITIONS) {
      if (d.library !== "hoa-ky") continue;
      expect(
        getCalculator(d.slug)?.usRules,
        `${d.slug} is filed under the Hoa Kỳ library but has no usRules flag`,
      ).toBe(true);
    }
  });

  it("never carries the US notice without the United States shelf", () => {
    // The REVERSE of the assertion above, which was missing — and the gap was
    // not theoretical. `nien-kim` shipped with `usRules: true`, a summary
    // ending "theo quy định Hoa Kỳ", and 35 "USD" figures in its content,
    // while filed `library: "dai-han"` — a US tax tool wearing a long-term
    // badge on the hub.
    //
    // One direction alone cannot catch that: the forward check only looks at
    // rows already on the shelf. A flag and a filing are two claims about the
    // same tool, so both directions have to agree, and the pair is what makes
    // either one trustworthy. The long-horizon unit resolved its own four rows
    // the other way — flag removed, filing kept — which is exactly why the
    // disagreement has to be surfaced rather than resolved by convention.
    for (const d of TOOL_DISPOSITIONS) {
      if (getCalculator(d.slug)?.usRules !== true) continue;
      expect(
        d.library,
        `${d.slug} renders the US notice but is filed on the ${d.library ?? "(no)"} shelf`,
      ).toBe("hoa-ky");
    }
  });

  it("says Hoa Kỳ in the NAME of a tool that models US law", () => {
    // The hub lists tools by TITLE, and search results show the title first.
    // "Ước tính an sinh xã hội" reads as a tool about Vietnamese social
    // insurance; it models United States Social Security. A Vietnamese reader
    // has no way to tell from the name, and the `us-rules` notice only
    // reaches them after they have opened the page and started filling it in.
    //
    // The summary carrying it is not enough: the hub truncates, and a title is
    // what gets linked, bookmarked and read aloud. Same family as the badge
    // disagreement above — a label that contradicts the page it names.
    // A title does NOT need the words when it already names something that
    // exists only in the United States — "401(k)", "IRA", "Roth", "HSA" are
    // proper nouns a reader cannot mistake for a Vietnamese product. Repeating
    // "Hoa Kỳ" after them would make the hub read like a disclaimer.
    //
    // The rule is about the opposite case: a title using words that DO name a
    // Vietnamese thing. "An sinh xã hội" is what BHXH is called here; Vietnam
    // taxes dividends; and "tiết kiệm thuế từ lãi vay" describes a mortgage
    // interest deduction Vietnam does not have — which is the worst of them,
    // because home buyers are this site's actual audience.
    const UNMISTAKABLY_US = ["401(k)", "IRA", "Roth", "HSA"];
    for (const d of TOOL_DISPOSITIONS) {
      const calc = getCalculator(d.slug);
      if (calc?.usRules !== true) continue;
      if (UNMISTAKABLY_US.some((term) => calc.title.includes(term))) continue;
      expect(
        calc.title,
        `${d.slug}'s title "${calc.title}" uses words that name a Vietnamese ` +
          `thing, but the tool models US law`,
      ).toContain("Hoa Kỳ");
    }
  });

  it("never files a P1 first-home-buyer tool on a library shelf", () => {
    // The five P1 tools are the acquisition path. A library badge on one of
    // them would be a contradiction: the badge exists to say "this is not
    // your home-buying journey".
    for (const d of dispositionsByPriority("P1")) {
      expect(d.library, `${d.slug} is P1 and should not be shelved`).toBeUndefined();
    }
  });

  it("points every P1 and P2 row at a calculator that actually works", () => {
    // These two tiers are linked from the question cards and the contextual
    // next steps. A planned-but-not-built slug there is a dead journey.
    const liveSlugs = new Set(liveCalculators().map((c) => c.slug));
    for (const priority of ["P1", "P2"] as ToolPriority[]) {
      for (const d of dispositionsByPriority(priority)) {
        expect(liveSlugs.has(d.slug), `${d.slug} (${priority}) is not live`).toBe(
          true,
        );
      }
    }
  });
});

// The reading-comprehension pass's own coverage, row by row. The founder's
// requirement is that every tool's explanation surface has a STATED
// disposition — not that all 75 get the same treatment.
describe("every tool has a stated reading disposition", () => {
  it("covers all 75 rows exactly once, with no extra slug", () => {
    const planned = TOOL_DISPOSITIONS.map((d) => d.slug).sort();
    const stated = Object.keys(READING_DISPOSITIONS).sort();
    expect(stated).toEqual(planned);
  });

  it("gives every P1 tool the emphasis treatment", () => {
    // The five first-home-buyer questions are the ones a reader arrives at
    // from an article, so the tool and the article must emphasise the same
    // distinction.
    for (const d of dispositionsByPriority("P1")) {
      expect(
        readingDispositionFor(d.slug),
        `${d.slug} is P1 but its explanation was not given emphasis`,
      ).toBe("emphasis");
    }
  });

  it("files no Vietnamese buyer-path tool as library reference", () => {
    // `reference` is the honest label for United States law, corporate
    // finance and investing study material. Using it on a P1/P2 buyer tool
    // would be a way of quietly skipping the pass.
    for (const priority of ["P1", "P2"] as ToolPriority[]) {
      for (const d of dispositionsByPriority(priority)) {
        expect(
          readingDispositionFor(d.slug),
          `${d.slug} (${priority}) is filed as library reference`,
        ).not.toBe("reference");
      }
    }
  });

  it("marks every US-law tool as reference, never as a reading funnel", () => {
    for (const d of TOOL_DISPOSITIONS) {
      if (d.library !== "hoa-ky") continue;
      expect(
        readingDispositionFor(d.slug),
        `${d.slug} models US law and should be reference material`,
      ).toBe("reference");
    }
  });

  it("actually applies emphasis wherever it claims to", () => {
    // The disposition is a claim about the shipped page. This is what stops
    // it being a spreadsheet entry: every `emphasis` row must have real
    // editor-selected phrases in its content file, and each phrase must
    // occur in the prose it was declared for.
    for (const [slug, disposition] of Object.entries(READING_DISPOSITIONS)) {
      if (disposition !== "emphasis") continue;
      const prose = CALCULATOR_PROSE[slug];
      expect(prose, `${slug} claims emphasis but is not wired here`).toBeDefined();
      expect(
        prose!.emphasis?.length ?? 0,
        `${slug} claims emphasis but declares no phrases`,
      ).toBeGreaterThan(0);
      const missing = missingPhrases(prose!.body, prose!.emphasis ?? []);
      expect(
        missing,
        `${slug} declares phrases that do not occur: ${missing.join(" / ")}`,
      ).toEqual([]);
    }
  });

  it("keeps a calculator's emphasis restrained", () => {
    // Same ratchet as the education collection's: emphasis everywhere is
    // emphasis nowhere.
    for (const [slug, prose] of Object.entries(CALCULATOR_PROSE)) {
      const share = emphasisShare(prose.body, prose.emphasis ?? []);
      expect(
        share,
        `${slug} emphasises ${(share * 100).toFixed(1)}% of its method`,
      ).toBeLessThan(0.2);
    }
  });

  // The honesty guard the review asked for: a treatment label must not be
  // readable as "this row is finished".
  it("lists every pending row against a real registry slug", () => {
    const known = new Set(TOOL_DISPOSITIONS.map((d) => d.slug));
    for (const slug of READING_WORK_PENDING) {
      expect(known.has(slug), `${slug} is pending but not a registry slug`).toBe(
        true,
      );
    }
    // No duplicates: a slug listed twice reads as two outstanding units.
    expect(new Set(READING_WORK_PENDING).size).toBe(
      READING_WORK_PENDING.length,
    );
  });

  it("keeps the pending list in step with the treatment each row ships, both ways", () => {
    // THIS REPLACES `expect(READING_WORK_PENDING.length).toBeGreaterThan(0)`,
    // whose comment was "And it is not empty: the capital and long-horizon
    // rows are open". That encoded a TEMPORARY truth as a permanent
    // invariant — exactly the "never pin the suite's own size" mistake docs §8
    // records — because the list legitimately reaches empty when the last
    // outstanding unit runs, and a correct repo would then fail this file.
    // Plan row 44 came off it in the long-term foundation slice; rows 45, 48
    // and 50 follow.
    //
    // The replacement is bidirectional, in the shape registry.test.ts uses for
    // the placeholder route, so BOTH mistakes are a red test naming the fix:
    //
    //   - bookkeeping without the work — a row taken off the list while still
    //     on an unverified label is the "coverage test as completion proof"
    //     the review rejected;
    //   - work without the bookkeeping — a row given the verified treatment
    //     and left on the list understates what has shipped.
    //
    // "Verified" has one meaning here and it is the one this file can actually
    // check: the row claims `emphasis` AND its own prose is wired into
    // CALCULATOR_PROSE with phrases that occur in it. Everything else is a
    // declaration, which is why the pending list exists at all.
    expect(inconsistentPendingRows(READING_WORK_PENDING)).toEqual([]);
  });

  it("accepts an empty pending list once every unit has run", () => {
    // The case the old guard made impossible to reach. Asserted against a
    // simulated list rather than by emptying the real one, so this stays true
    // while three rows are still genuinely outstanding.
    expect(inconsistentPendingRows([])).toEqual([]);
  });

  it("still catches a row taken off the list without the work", () => {
    // And the guard is not vacuous: a row that ships verified emphasis must be
    // reported when listed as pending, and a legitimately pending row must not.
    //
    // Both controls are DERIVED rather than named, and that is the point. An
    // earlier version of this test named `tinh-huu-tri` as its legitimately
    // pending example, and went red the day that row shipped its emphasis —
    // which is the very mistake this block exists to prevent ("a temporary
    // truth as a permanent invariant"), reintroduced one level down inside the
    // fixture. A derived control follows the data instead of dating with it.
    const slugs = Object.keys(READING_DISPOSITIONS);
    const shipped = slugs.find((slug) => shipsVerifiedEmphasis(slug));
    const pendingOk = slugs.find(
      (slug) =>
        !shipsVerifiedEmphasis(slug) &&
        readingDispositionFor(slug) !== "emphasis",
    );
    expect(shipped, "no row ships verified emphasis to test against").toBeDefined();
    expect(pendingOk, "no row is legitimately pending to test against").toBeDefined();

    const found = inconsistentPendingRows([shipped!, pendingOk!]);
    expect(found.map((row) => row.slug)).toEqual([shipped]);
  });

  it("claims no emphasis on a row whose own unit has not run", () => {
    // `emphasis` is the one treatment this pass VERIFIES against the shipped
    // content. Claiming it for a row still on its pre-plan form would be
    // exactly the "coverage test as completion proof" the review rejected.
    for (const slug of READING_WORK_PENDING) {
      expect(
        readingDispositionFor(slug),
        `${slug} is pending but claims the verified emphasis treatment`,
      ).not.toBe("emphasis");
      expect(readingWorkPending(slug)).toBe(true);
    }
  });

  it("does not mark the nine emphasis rows as pending", () => {
    for (const [slug, disposition] of Object.entries(READING_DISPOSITIONS)) {
      if (disposition !== "emphasis") continue;
      expect(readingWorkPending(slug), `${slug}`).toBe(false);
    }
  });

  it("leaves the direct utilities plain, as their disposition says", () => {
    for (const [slug, disposition] of Object.entries(READING_DISPOSITIONS)) {
      if (disposition !== "direct") continue;
      const prose = CALCULATOR_PROSE[slug];
      if (!prose) continue;
      expect(
        prose.emphasis,
        `${slug} is filed as a direct utility but carries emphasis`,
      ).toBeUndefined();
    }
  });
});
