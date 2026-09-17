import { describe, it, expect } from "vitest";
import {
  EDUCATION_ARTICLES,
  articlesInGroup,
  collectionOutline,
  getEducationArticle,
} from "@/content/education/articles";
import { EDUCATION_GROUPS } from "@/content/education/groups";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { EDUCATION_COLLECTION } from "@/content/education/collection";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { getCalculator, liveCalculators } from "@/content/calculators/registry";
import { POSTS, educationPosts, newsPosts, postKind } from "@/content/posts";
import { TOPICS } from "@/content/blog-topics";
import { computeApr } from "@/lib/calc/apr";
import { computeGraceLoan } from "@/lib/calc/grace-loan";
import { analyseLoan } from "@/lib/calc/loan-analysis";
import { formatDecimal, formatMoney, formatPercent } from "@/lib/calc/number";

/**
 * The collection's contract.
 *
 * Two things these tests exist to stop:
 *
 * 1. A STUB shipping as an article. Every required part is a separate field,
 *    so "has a body" is checkable rather than a matter of opinion — and the
 *    thresholds below are deliberately high enough that a placeholder fails.
 * 2. Selected numerical anchors drifting. Visuals resolve with the production
 *    engine; financial-semantics.test.ts adds independent counterexamples.
 *    These checks do not validate every sentence or professional suitability.
 */

describe("the collection covers the plan", () => {
  it("numbers its articles C01 upward with no gap and no repeat", () => {
    // THE COUNT IS DERIVED, NOT PINNED. This assertion used to read
    // `toHaveLength(12)` plus a hand-typed C01…C12 list, which is the
    // "never pin the suite's own size" mistake docs §8 records: a correct
    // repository goes red on it the day a thirteenth article ships, and the
    // fix looks identical to the bug. What actually matters is the PROPERTY —
    // the ids are a contiguous run from C01, so no article shares an id and
    // none was dropped — and that holds at any size.
    //
    // Which calculator rows are still WITHOUT an article is a separate
    // question with its own bidirectional guard in `coverage.test.ts`; it is
    // not answerable from a count here.
    const expected = EDUCATION_ARTICLES.map(
      (_, index) => `C${String(index + 1).padStart(2, "0")}`,
    );
    const ids = EDUCATION_ARTICLES.map((a) => a.planId).sort();
    expect(ids).toEqual(expected);
    expect(EDUCATION_ARTICLES.length).toBeGreaterThan(0);
  });

  it("uses each slug once, in kebab-case ASCII", () => {
    const slugs = EDUCATION_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("gives every article exactly one group, and fills all five", () => {
    // Mutually exclusive: one group per article, no article outside the five.
    const groupIds = EDUCATION_GROUPS.map((g) => g.id);
    for (const article of EDUCATION_ARTICLES) {
      expect(groupIds, article.slug).toContain(article.group);
    }
    for (const group of EDUCATION_GROUPS) {
      expect(
        articlesInGroup(group.id).length,
        `group ${group.id} has no article`,
      ).toBeGreaterThan(0);
    }
    const covered = collectionOutline().reduce(
      (sum, entry) => sum + entry.articles.length,
      0,
    );
    expect(covered).toBe(EDUCATION_ARTICLES.length);
  });

  it("finds every article by slug", () => {
    for (const article of EDUCATION_ARTICLES) {
      expect(getEducationArticle(article.slug)).toBe(article);
    }
    expect(getEducationArticle("khong-ton-tai")).toBeUndefined();
  });
});

describe("every article is a real article, not a stub", () => {
  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s has a question, an answer and a declared hypothetical",
    (_slug, article) => {
      expect(article.question.trim().endsWith("?")).toBe(true);
      expect(article.shortAnswer.length).toBeGreaterThanOrEqual(2);
      for (const paragraph of article.shortAnswer) {
        expect(paragraph.length).toBeGreaterThan(60);
      }
      expect(article.household.items.length).toBeGreaterThanOrEqual(4);
      expect(article.household.note.length).toBeGreaterThan(60);
    },
  );

  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s has a body of substantive sections",
    (_slug, article) => {
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      const words = article.sections
        .flatMap((s) => s.paragraphs)
        .join(" ")
        .split(/\s+/).length;
      // A stub does not reach this. The shortest real article in the
      // collection is comfortably past it.
      expect(words, `${article.slug} body is ${words} words`).toBeGreaterThan(
        380,
      );
      for (const section of article.sections) {
        expect(section.heading.length).toBeGreaterThan(15);
        expect(section.paragraphs.length).toBeGreaterThanOrEqual(2);
      }
    },
  );

  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s has an exercise on a live tool, with a change and a check",
    (_slug, article) => {
      const tool = getCalculator(article.exercise.toolSlug);
      expect(tool, article.exercise.toolSlug).toBeDefined();
      expect(tool?.status).toBe("live");
      expect(article.exercise.steps.length).toBeGreaterThanOrEqual(3);
      expect(article.exercise.change.length).toBeGreaterThan(40);
      expect(article.exercise.check.length).toBeGreaterThan(40);
    },
  );

  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s states its limits and its sources",
    (_slug, article) => {
      expect(article.limits.items.length).toBeGreaterThanOrEqual(3);
      expect(article.sources.items.length).toBeGreaterThanOrEqual(1);
      for (const source of article.sources.items) {
        expect(source.url).toMatch(/^https:\/\//);
        // Every source says which single concept it supports, so it cannot be
        // read as backing a figure it does not back.
        expect(source.note.length, source.url).toBeGreaterThan(80);
      }
      expect(article.provenance.length).toBeGreaterThan(120);
    },
  );

  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s links only to other articles in the collection",
    (_slug, article) => {
      for (const next of article.nextSlugs) {
        expect(getEducationArticle(next), `${article.slug} -> ${next}`)
          .toBeDefined();
        expect(next).not.toBe(article.slug);
      }
    },
  );
});

describe("every article's visual computes from its own hypothetical", () => {
  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s resolves to something renderable",
    (_slug, article) => {
      const visual = resolveEducationVisual(
        article.visual,
        EDUCATION_VISUAL_LABELS,
      );
      if (visual.kind === "chart") {
        // The declared hypothetical must actually compute: an `unavailable`
        // model in an article means the article's own example is broken.
        expect(visual.model.unavailable, article.slug).toBeNull();
        expect(visual.model.table.rows.length).toBeGreaterThan(0);
        expect(visual.model.summary).not.toMatch(/\{[a-z]+\}/i);
      } else {
        expect(visual.unavailable, article.slug).toBeNull();
        expect(visual.table.rows.length).toBeGreaterThan(0);
        expect(visual.assumptions.length).toBeGreaterThan(0);
      }
    },
  );

  it("assumes nothing about a table row C09's table does not have", () => {
    // C09 replaces the tool's per-month table with an endpoint summary, so it
    // must not inherit the shared clause explaining what later MONTH rows do
    // once a plan is funded — there are no month rows to look at.
    const c09 = EDUCATION_ARTICLES.find((a) => a.planId === "C09")!;
    const visual = resolveEducationVisual(c09.visual, EDUCATION_VISUAL_LABELS);
    expect(visual.kind).toBe("chart");
    if (visual.kind !== "chart") return;
    const assumptions = visual.model.assumptions.join(" ");
    expect(assumptions).not.toContain("để trống");
    expect(assumptions).toContain("KỲ GÓP TRỌN VẸN");
    // The rows are the article's own comparison figures, not months.
    expect(visual.model.table.rows.length).toBeGreaterThan(0);
    for (const row of visual.model.table.rows) {
      expect(typeof row[0]).toBe("string");
    }
  });

  it("C08 compares over TIME under at least two named price assumptions", () => {
    // The plan row asks for "so dòng tiền/tài sản theo thời gian, ít nhất hai
    // kịch bản giá". An endpoint table met neither half.
    const c08 = EDUCATION_ARTICLES.find((a) => a.planId === "C08")!;
    expect(c08.visual.kind).toBe("rentBuyScenarios");
    if (c08.visual.kind !== "rentBuyScenarios") return;
    expect(c08.visual.growthPercents.length).toBeGreaterThanOrEqual(2);

    const visual = resolveEducationVisual(c08.visual, EDUCATION_VISUAL_LABELS);
    expect(visual.kind).toBe("chart");
    if (visual.kind !== "chart") return;
    const model = visual.model;
    expect(model.unavailable).toBeNull();
    expect(model.kind).toBe("lines");
    if (model.kind !== "lines") return;

    // One line per declared assumption, over the article's own horizon, each
    // told apart by something other than colour.
    expect(model.series).toHaveLength(c08.visual.growthPercents.length);
    expect(model.xMax).toBe(c08.visual.input.horizonMonths);
    expect(new Set(model.series.map((s) => s.stroke)).size).toBe(
      model.series.length,
    );
    for (const series of model.series) {
      expect(series.points.length).toBeGreaterThan(2);
      expect(series.points[0].period).toBe(0);
      expect(series.label).toMatch(/0%|3%|5%/);
    }
    // Zero is inside the plot, so "which side is ahead" is readable, and a
    // renting-ahead month is drawn below it rather than clamped away.
    expect(model.yMin).toBeLessThan(0);
    expect(model.references.map((r) => r.value)).toEqual([0]);

    // The accessible table is the exact endpoint reading, one row per
    // assumption: four columns, the same three rates, raw money cells.
    expect(model.table.rows).toHaveLength(c08.visual.growthPercents.length);
    const rentCosts: number[] = [];
    const advantages: number[] = [];
    for (const row of model.table.rows) {
      expect(typeof row[0]).toBe("string");
      expect(row[0]).toMatch(/Giá nhà .*%\/năm/);
      for (const cell of row.slice(1)) {
        expect(
          typeof cell === "object" && cell !== null && cell.kind === "money",
        ).toBe(true);
      }
      rentCosts.push((row[2] as { value: number }).value);
      advantages.push((row[3] as { value: number }).value);
    }
    // The renter's figures do not move with a house-price assumption, so the
    // three rows differ only on the buying side.
    for (const cost of rentCosts) {
      expect(Math.abs(cost - rentCosts[0])).toBeLessThan(1e-2);
    }
    // A higher assumed growth cannot make buying worse on this fixture, and
    // the spread between the outer two is the article's whole point.
    expect(advantages[1]).toBeGreaterThan(advantages[0]);
    expect(advantages[2]).toBeGreaterThan(advantages[1]);
  });

  it("teaches the same tool its exercise links to", () => {
    // A chart built from the mortgage engine under an exercise that opens the
    // savings tool would be a coherent page about two different things.
    const engineByKind: Record<string, string[]> = {
      loanColumns: ["vay-mua-nha"],
      floatingTimeline: ["lai-suat-tha-noi"],
      savingsCurve: ["muc-tieu-tiet-kiem"],
      savingsComparePaths: ["muc-tieu-tiet-kiem"],
      // TWO ROUTES, ONE ENGINE. `nha-o-xa-hoi` renders the same
      // `AffordabilityCalculator` at the social-housing programme's opening
      // parameters, so an `affordabilityPrice` visual pairs correctly with
      // either route — the invariant this map guards is "the chart's engine is
      // the tool's engine", and here it is the same engine. C16's exercise
      // opens the NOXH route because its figures are the NOXH programme's.
      affordabilityPrice: ["kha-nang-mua-nha", "nha-o-xa-hoi"],
      affordabilityMonthly: ["kha-nang-mua-nha", "nha-o-xa-hoi"],
      compareCost: ["so-sanh-khoan-vay"],
      comparePayments: ["so-sanh-khoan-vay"],
      rentBuyScenarios: ["thue-hay-mua"],
      fixedFloatingTable: ["lai-co-dinh-hay-tha-noi"],
      fixedFloatingPaths: ["lai-co-dinh-hay-tha-noi"],
      refinanceTable: ["tai-cap-von"],
      refinanceCostPath: ["tai-cap-von"],
      // Both debt-path kinds are the mortgage engine. C07 sends the reader
      // to the comparison tool, where two terms are two named alternatives;
      // C10 to the mortgage tool's own extra-payment mode.
      loanTermDebtPaths: ["so-sanh-khoan-vay"],
      extraPaymentDebtPaths: ["vay-mua-nha"],
      // The three P2 rows accepted into the collection. Each one's figure is
      // drawn by the adapter its OWN route uses, so there is no article whose
      // picture comes from a tool it does not open. `apr-nang-cao` is
      // deliberately not listed beside `apr`: it is the same component at
      // `initialMode="advanced"`, and C13's figure already carries the payoff
      // bar that mode exists for — recorded in `coverage.ts`.
      aprRateBars: ["apr"],
      graceLoanPhases: ["chi-tra-lai"],
      loanCostQuarters: ["phan-tich-khoan-vay"],
    };
    for (const article of EDUCATION_ARTICLES) {
      const allowed = engineByKind[article.visual.kind];
      expect(allowed, `no mapping for ${article.visual.kind}`).toBeDefined();
      expect(
        allowed,
        `${article.slug} draws a ${article.visual.kind} but sends the reader to ${article.exercise.toolSlug}`,
      ).toContain(article.exercise.toolSlug);
    }
  });
});

describe("the figures the prose quotes", () => {
  /** Resolve one article's visual and collect every string it renders. */
  function renderedStrings(slug: string): string {
    const article = getEducationArticle(slug)!;
    const visual = resolveEducationVisual(
      article.visual,
      EDUCATION_VISUAL_LABELS,
    );
    const rows =
      visual.kind === "chart" ? visual.model.table.rows : visual.table.rows;
    const summary =
      visual.kind === "chart" ? visual.model.summary : visual.summary;
    return [summary, ...rows.flat()].join(" | ");
  }

  it("C02 quotes the instalment its own chart is built from", () => {
    const article = getEducationArticle("vay-2-ty-moi-thang-tra-bao-nhieu")!;
    const prose = [
      ...article.shortAnswer,
      ...article.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    // These are the strings the mortgage engine produces for this loan; the
    // mortgage content test pins them independently against the annuity
    // formula.
    expect(prose).toContain("17.356.465");
    expect(prose).toContain("19.356.465");
    expect(prose).toContain("9.549.208");
    expect(prose).toContain("14.166.667");
    expect(prose).toContain("3.189.798");
    // And the same schedule is what the chart draws.
    expect(renderedStrings(article.slug).length).toBeGreaterThan(50);
  });

  it("C03 quotes both rate framings, so they cannot be confused", () => {
    const article = getEducationArticle("het-uu-dai-khoan-tra-tang-bao-nhieu")!;
    const prose = [
      ...article.shortAnswer,
      ...article.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    expect(prose).toContain("3,5 ĐIỂM PHẦN TRĂM");
    expect(prose).toContain("46,67%");
    expect(prose).toContain("27,11%");
    expect(prose).toContain("28,13%");
    // The corrected causal claim: a lower rate retires MORE principal.
    expect(prose).toContain("3.611.864");
    expect(prose).toContain("2.310.435");
  });

  it("C03 does not repeat the old backwards explanation", () => {
    const article = getEducationArticle("het-uu-dai-khoan-tra-tang-bao-nhieu")!;
    const prose = article.sections.flatMap((s) => s.paragraphs).join(" ");
    // The reviewed defect: blaming the low promotional rate for slow principal
    // reduction. It says the opposite now, explicitly.
    expect(prose).toContain("Lãi cao hơn trả được ÍT gốc hơn");
  });

  it("C07 quotes both terms' instalments and the interest gap", () => {
    const article = getEducationArticle("vay-20-nam-hay-25-nam")!;
    const prose = [
      ...article.shortAnswer,
      ...article.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    expect(prose).toContain("17.356.465");
    expect(prose).toContain("16.104.542");
    expect(prose).toContain("2.165.551.520");
    expect(prose).toContain("2.831.362.501");
    expect(prose).toContain("665.810.981");
    // 2.831.362.501 − 2.165.551.520 = 665.810.981.
    expect(2_831_362_501 - 2_165_551_520).toBe(665_810_981);
  });

  it("C04 and C09 quote the savings engine's own contributions", () => {
    const c04 = getEducationArticle("du-tien-tra-truoc-sau-3-nam")!;
    const prose = [
      ...c04.shortAnswer,
      ...c04.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    expect(prose).toContain("9.668.775");
    expect(prose).toContain("11.111.111");
    expect(prose).toContain("448.075.899");
    expect(prose).toContain("51.924.101");
    // C09's figures live in its table rather than its prose, on purpose.
    const rows = renderedStrings("gop-them-2-trieu-dat-muc-tieu-som-bao-lau");
    expect(rows).toContain("8.000.000 ₫");
    expect(rows).toContain("10.000.000 ₫");
  });

  it("C10 quotes the saving and the months its chart is built from", () => {
    const article = getEducationArticle(
      "co-tien-du-tra-them-no-giam-bao-nhieu-lai",
    )!;
    const prose = [
      ...article.shortAnswer,
      ...article.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    expect(prose).toContain("555.699.884");
    expect(prose).toContain("53 tháng");
    expect(prose).toContain("187");
  });
});

/**
 * C13, C14 and C15 — the three accepted P2 rows — against their OWN engines.
 *
 * Every figure is recomputed here by calling the production engine on the
 * article's declared hypothetical, then formatted with `formatMoney` /
 * `formatPercent` and asserted to be the string the prose contains. So a
 * figure cannot be typed by hand, and a default moving inside an engine goes
 * red here rather than leaving the article quoting a number the linked tool no
 * longer produces.
 *
 * THE INPUTS COME FROM THE ARTICLE, NOT FROM A COPY. Each block reads
 * `article.visual.input`, so the hypothetical the prose is checked against is
 * literally the one the figure is drawn from — the failure mode this pinning
 * exists to prevent is the two drifting apart, and a second hand-typed input
 * object here would be exactly that drift with a test around it.
 *
 * NOTHING BELOW ASSERTS A FORMATTED ZERO. `formatMoney(0)` is `"0"`, which
 * almost any Vietnamese sentence contains, so `toContain` on it passes
 * vacuously — docs §8 records two agents hitting that in one session. Where a
 * zero matters (the grace phases repay no principal) it is asserted on the
 * NUMBER from the engine, not on a substring of the copy.
 */
describe("the three accepted P2 articles quote their own engines", () => {
  /** Every sentence an article renders as prose. */
  const prose = (slug: string) => {
    const article = getEducationArticle(slug)!;
    return [
      ...article.shortAnswer,
      ...article.sections.flatMap((s) => s.paragraphs),
      article.visualReading,
      article.exercise.change,
    ].join(" ");
  };

  it("C13 quotes the APR its own bars are built from, at every horizon", () => {
    const article = getEducationArticle(
      "lai-suat-quang-cao-va-chi-phi-vay-that",
    )!;
    expect(article.visual.kind).toBe("aprRateBars");
    if (article.visual.kind !== "aprRateBars") return;
    const quoteA = article.visual.input;
    // Quote A is the article's declared hypothetical and the figure's input.
    const a = computeApr(quoteA)!;
    expect(a).not.toBeNull();
    const words = prose(article.slug);

    expect(words).toContain(formatPercent(a.aprPercent!, 4)); // 8,7081%
    expect(words).toContain(formatPercent(a.payoffAprPercent!, 4)); // 8,8923%
    expect(words).toContain(formatMoney(a.monthlyPayment)); // 17.356.465
    expect(words).toContain(formatMoney(a.netProceeds)); // 1.970.000.000
    expect(words).toContain(formatDecimal(a.aprSpreadPoints!, 4)); // 0,2081
    expect(words).toContain(formatMoney(a.totalCost)); // 2.195.551.520
    expect(words).toContain(formatMoney(a.payoffCost!)); // 833.931.542
    expect(words).toContain(formatMoney(a.payoffPrincipalRepaid!));

    // The horizon ladder in section two, each solved separately.
    for (const months of [120, 60, 36, 24]) {
      const at = computeApr({ ...quoteA, payoffMonths: months })!;
      expect(
        words,
        `C13 does not quote the APR at month ${months}`,
      ).toContain(formatPercent(at.payoffAprPercent!, 4));
    }
    // And the 24-month figure's spread, quoted in points rather than percent.
    const at24 = computeApr({ ...quoteA, payoffMonths: 24 })!;
    expect(words).toContain(
      formatDecimal(at24.payoffAprPercent! - quoteA.annualRatePercent, 4),
    ); // 0,8409

    // The fee rolled into the principal instead of paid in cash: same fee,
    // different payment and a slightly LOWER equivalent rate.
    const financed = computeApr({
      amount: quoteA.amount,
      annualRatePercent: quoteA.annualRatePercent,
      termMonths: quoteA.termMonths,
      financedFees: quoteA.upfrontFees,
    })!;
    expect(words).toContain(formatPercent(financed.aprPercent!, 4)); // 8,7050%
    expect(words).toContain(formatMoney(financed.monthlyPayment)); // 17.616.812
    expect(words).toContain(formatMoney(financed.principal)); // 2.030.000.000
    expect(financed.aprPercent!).toBeLessThan(a.aprPercent!);

    // The fee-free control: the equivalent rate IS the contract rate, at any
    // horizon, which is what makes the horizon ladder above about the fee.
    const noFee = computeApr({ ...quoteA, upfrontFees: 0 })!;
    // COMPARED AS FORMATTED STRINGS, NOT AS RAW NUMBERS, and this assertion
    // is why: the APR has no closed form and is solved numerically, so the
    // fee-free case comes back as 8.500000002804683 rather than 8.5 and a
    // `toBeCloseTo(…, 9)` goes red on solver residue. What the article claims
    // is about the number a reader SEES — the tool prints four decimals — so
    // the honest check is at the displayed precision. docs §4's rule, applied
    // to a rate instead of a percentage difference.
    const contractRate = formatPercent(quoteA.annualRatePercent, 4);
    expect(formatPercent(noFee.aprPercent!, 4)).toBe(contractRate);
    expect(formatPercent(noFee.payoffAprPercent!, 4)).toBe(contractRate);
    expect(words).toContain(contractRate); // 8,5000%

    // Quote B — the fee-free 8,8% offer the article ranks A against. It is
    // NOT the figure's input, on purpose: the visual carries one plan, and
    // the comparison lives in the prose and the exercise.
    const b = computeApr({ ...quoteA, annualRatePercent: 8.8, upfrontFees: 0 })!;
    expect(words).toContain(formatPercent(b.aprPercent!, 4)); // 8,8000%
    expect(words).toContain(formatMoney(b.totalCost)); // 2.257.137.303
    expect(words).toContain(formatMoney(b.payoffCost!)); // 833.838.299
    expect(words).toContain(formatMoney(b.payoffPrincipalRepaid!));
    expect(words).toContain(formatMoney(b.totalCost - a.totalCost)); // 61.585.783
    expect(words).toContain(formatMoney(a.payoffCost! - b.payoffCost!)); // 93.243

    // THE FLIP, as an assertion rather than a sentence: A is cheaper over the
    // full term and B has the lower rate at the article's stated horizon.
    // Routed through `formatDecimal` for the quoted gap because a difference
    // of two solved rates is exactly the float-noise case docs §4 warns about.
    expect(a.aprPercent!).toBeLessThan(b.aprPercent!);
    expect(a.payoffAprPercent!).toBeGreaterThan(b.aprPercent!);
    expect(words).toContain(
      formatDecimal(a.payoffAprPercent! - b.aprPercent!, 4),
    ); // 0,0923
  });

  it("C14 quotes the three phase instalments and the cost of the grace", () => {
    const article = getEducationArticle(
      "het-an-han-goc-khoan-tra-tang-bao-nhieu",
    )!;
    expect(article.visual.kind).toBe("graceLoanPhases");
    if (article.visual.kind !== "graceLoanPhases") return;
    const input = article.visual.input;
    const g = computeGraceLoan(input)!;
    expect(g).not.toBeNull();
    const words = prose(article.slug);

    // Three phases, and the first two repay no principal at all. Asserted on
    // the engine's NUMBER — `formatMoney(0)` is "0" and would pass on any
    // sentence containing a digit.
    expect(g.phases).toHaveLength(3);
    expect(g.phases[0].principal).toBe(0);
    expect(g.phases[1].principal).toBe(0);
    expect(g.phases[2].principal).toBeGreaterThan(0);

    expect(words).toContain(formatMoney(g.firstPayment)); // 12.500.000
    expect(words).toContain(formatMoney(g.lastGracePayment!)); // 18.333.333
    expect(words).toContain(formatMoney(g.firstAmortizingPayment)); // 21.300.993
    expect(words).toContain(formatMoney(g.graceJump!)); // 2.967.660
    expect(words).toContain(formatMoney(g.totalInterest)); // 2.971.014.458
    expect(words).toContain(formatMoney(g.comparableTotalInterest!));
    expect(words).toContain(formatMoney(g.extraInterest!)); // 108.381.135
    expect(words).toContain(`tháng ${formatDecimal(g.firstAmortizingMonth, 0)}`);

    // The promotional reset lands INSIDE the grace period, which is why the
    // instalment rises twice. Both the step and the month are quoted.
    const promoJump = g.schedule[12].payment - g.schedule[11].payment;
    expect(words).toContain(formatMoney(promoJump)); // 5.833.333
    expect(g.promoEndMonth).toBe(input.promoMonths);
    expect(g.graceEndMonth).toBe(input.graceMonths);
    expect(g.promoEndMonth!).toBeLessThan(g.graceEndMonth!);

    // The article's own identity claim: the step at the end of the grace is
    // EXACTLY the first amortizing month's principal, so every đồng of the
    // rise buys debt reduction rather than interest.
    expect(g.graceJump!).toBeCloseTo(g.schedule[24].principal, 6);
    expect(words).toContain(formatMoney(g.schedule[24].principal));

    // The balance does not move for the whole grace, and the no-grace loan's
    // does. Both figures are quoted.
    expect(g.balanceAtGraceEnd!).toBeCloseTo(input.amount, 6);
    expect(words).toContain(formatMoney(g.balanceAtGraceEnd!));
    const graceInterest = g.schedule
      .slice(0, input.graceMonths)
      .reduce((sum, row) => sum + row.interest, 0);
    expect(words).toContain(formatMoney(graceInterest)); // 370.000.000

    const noGrace = computeGraceLoan({ ...input, graceMonths: 0 })!;
    const noGraceBalance = noGrace.schedule[input.graceMonths - 1].balance;
    expect(words).toContain(formatMoney(noGraceBalance)); // 1.922.853.684
    expect(words).toContain(formatMoney(input.amount - noGraceBalance));
    expect(words).toContain(formatMoney(noGrace.postResetPayment!)); // 20.479.346
    expect(noGraceBalance).toBeLessThan(g.balanceAtGraceEnd!);

    // The two percentages, both formatted rather than interpolated raw: a
    // ratio of two engine figures is float-noisy (docs §4).
    expect(words).toContain(
      formatPercent((g.firstAmortizingPayment / g.firstPayment - 1) * 100, 2),
    ); // 70,41%
    expect(words).toContain(
      formatPercent((g.extraInterest! / g.comparableTotalInterest!) * 100, 2),
    ); // 3,79%
  });

  it("C15 quotes the milestone months its quarter bars come from", () => {
    const article = getEducationArticle("tra-5-nam-no-giam-bao-nhieu")!;
    expect(article.visual.kind).toBe("loanCostQuarters");
    if (article.visual.kind !== "loanCostQuarters") return;
    const input = article.visual.input;
    const an = analyseLoan(input)!;
    expect(an).not.toBeNull();
    const words = prose(article.slug);
    const selected = an.selected!;

    expect(words).toContain(formatMoney(an.loan.monthlyPrincipalInterest));
    expect(words).toContain(formatMoney(an.loan.totalInterest)); // 2.165.551.520
    expect(words).toContain(formatPercent(an.interestToPrincipalPercent, 2)); // 108,28%
    expect(words).toContain(
      formatPercent(an.firstPaymentInterestSharePercent, 2),
    ); // 81,62%
    expect(words).toContain(
      formatPercent(an.lastPaymentInterestSharePercent, 2),
    ); // 0,70%

    // The three milestone months, each quoted as "tháng N" so a bare number
    // cannot satisfy the assertion by appearing inside some other figure.
    expect(words).toContain(`tháng ${formatDecimal(an.crossoverMonth!, 0)}`); // 143
    expect(words).toContain(`tháng ${formatDecimal(an.halfInterestMonth!, 0)}`); // 84
    expect(words).toContain(`tháng ${formatDecimal(an.halfPrincipalMonth!, 0)}`); // 166
    expect(words).toContain(
      formatPercent(an.halfInterestTermSharePercent!, 1),
    ); // 35,0%
    expect(words).toContain(
      formatPercent(an.halfPrincipalTermSharePercent!, 1),
    ); // 69,2%
    expect(words).toContain(
      `${formatDecimal(an.halfPrincipalMonth! - an.halfInterestMonth!, 0)} tháng`,
    ); // 82 tháng

    // The crossover is PAST the midpoint, which is the section's whole claim.
    expect(an.crossoverMonth!).toBeGreaterThan(input.termMonths / 2);

    // The examined month — the "sell in year five" figures.
    expect(words).toContain(formatMoney(selected.balance)); // 1.762.543.662
    expect(words).toContain(formatMoney(selected.cumulativeInterest));
    expect(words).toContain(formatMoney(selected.cumulativePrincipal));
    expect(words).toContain(formatPercent(selected.interestSharePercent, 2)); // 72,13%
    expect(words).toContain(
      formatPercent(selected.principalRepaidSharePercent, 2),
    ); // 11,87%
    expect(words).toContain(formatMoney(selected.interest));
    expect(words).toContain(formatMoney(selected.principal));
    expect(words).toContain(
      formatMoney(selected.month * an.loan.monthlyPrincipalInterest),
    ); // 1.041.387.880

    // The two quarter shares the prose and the figure's own summary share.
    expect(an.segments).toHaveLength(4);
    const firstShare = formatPercent(an.segments[0].interestSharePercent, 1);
    const lastShare = formatPercent(an.segments[3].interestSharePercent, 1);
    expect(words).toContain(firstShare); // 77,2%
    expect(words).toContain(lastShare); // 18,8%

    // The figure's summary is built from the SAME call, so the sentence under
    // the chart and the sentence in the body cannot quote different shares.
    const visual = resolveEducationVisual(
      article.visual,
      EDUCATION_VISUAL_LABELS,
    );
    expect(visual.kind).toBe("chart");
    if (visual.kind !== "chart") return;
    expect(visual.model.summary).toContain(firstShare);
    expect(visual.model.summary).toContain(lastShare);
    expect(visual.model.summary).toContain(
      formatDecimal(an.crossoverMonth!, 0),
    );
    // Four bars, and the emphasised one is the quarter holding the crossover.
    if (visual.model.kind !== "bars") throw new Error("not bars");
    expect(visual.model.bars).toHaveLength(4);
    const emphasised = visual.model.bars.filter((bar) => bar.emphasis);
    expect(emphasised).toHaveLength(1);
    expect(emphasised[0].key).toBe("quarter-3");
  });
});

describe("no unverified market claim anywhere in the collection", () => {
  const allProse = EDUCATION_ARTICLES.flatMap((a) => [
    a.question,
    ...a.shortAnswer,
    a.household.note,
    ...a.household.items.map((i) => `${i.label} ${i.value}`),
    ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    a.exercise.intro,
    ...a.exercise.steps,
    a.exercise.change,
    a.exercise.check,
    ...a.limits.items,
    a.sources.intro,
    ...a.sources.items.map((s) => s.note),
    a.provenance,
  ]).join(" ");

  it("quotes no prepayment-fee or underwriting-ratio range", () => {
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(allProse, `collection quotes "${range}"`).not.toContain(range);
    }
  });

  it("never predicts that a payment or a price WILL rise", () => {
    for (const phrase of ["sẽ tăng", "chắc chắn tăng", "sẽ giảm"]) {
      expect(allProse, `collection predicts "${phrase}"`).not.toContain(phrase);
    }
  });

  it("never claims a bank has approved or will lend an amount", () => {
    for (const phrase of [
      "ngân hàng cam kết",
      "được ngân hàng duyệt",
      "ngân hàng sẽ cho vay",
    ]) {
      expect(allProse, `collection claims "${phrase}"`).not.toContain(phrase);
    }
  });

  it("declares every example as hypothetical", () => {
    // Each article's own household note has to say so; the word is the signal
    // a reader looks for.
    for (const article of EDUCATION_ARTICLES) {
      expect(
        /giả lập|giả định/i.test(article.household.note),
        `${article.slug} does not declare its example hypothetical`,
      ).toBe(true);
    }
  });

  it("fabricates no reviewer, approval or professional sign-off", () => {
    for (const article of EDUCATION_ARTICLES) {
      expect(article.provenance).toContain("FinHome");
      // Says what has NOT been reviewed, rather than naming a reviewer.
      expect(
        /chưa được .*(thẩm định|kiểm duyệt)/.test(article.provenance),
        `${article.slug} does not state its review limit`,
      ).toBe(true);
    }
    for (const phrase of [
      "đã được thẩm định bởi",
      "chuyên gia của chúng tôi khuyến nghị",
      "được luật sư",
    ]) {
      expect(allProse, `collection claims "${phrase}"`).not.toContain(phrase);
    }
  });
});

describe("the collection sits beside the news feed, not inside it", () => {
  it("registers every article in POSTS, as education", () => {
    // Derived from the collection rather than pinned, for the same reason the
    // plan-id run above is: the invariant is "one POSTS entry per article and
    // no education entry without an article", which is size-independent.
    const registered = educationPosts();
    expect(registered).toHaveLength(EDUCATION_ARTICLES.length);
    for (const article of EDUCATION_ARTICLES) {
      const post = registered.find((p) => p.slug === article.slug);
      expect(post, `${article.slug} is not in POSTS`).toBeDefined();
      expect(postKind(post!)).toBe("education");
    }
  });

  it("keeps them out of the news feed and every topic filter", () => {
    const newsSlugs = new Set(newsPosts().map((p) => p.slug));
    for (const article of EDUCATION_ARTICLES) {
      expect(newsSlugs.has(article.slug), article.slug).toBe(false);
    }
    // And they carry no market topic, so no topic filter can surface them.
    for (const post of educationPosts()) {
      expect(post.topics).toEqual([]);
    }
    // The four market topics are untouched.
    expect(TOPICS).toHaveLength(4);
  });

  it("leaves every news post in the feed", () => {
    // The whole point of the `kind` split: nothing existing moved. Every news
    // entry keeps at least one market topic, which is what the four filters
    // operate on. Cover and source are checked per entry by the seo-blog rules
    // rather than here — some legacy entries predate both conventions.
    expect(newsPosts().length).toBe(POSTS.length - EDUCATION_ARTICLES.length);
    for (const post of newsPosts()) {
      expect(post.topics.length, post.slug).toBeGreaterThan(0);
    }
  });

  it("gives education articles no cover and no third-party source", () => {
    for (const post of educationPosts()) {
      // No stock photograph, and nothing to attribute: these are original
      // exercises, not summaries of someone's report.
      expect(post.cover).toBeUndefined();
      expect(post.source).toBeUndefined();
      // But they do get a date, a category and an excerpt for the card.
      expect(post.date).toBeTruthy();
      expect(post.category).toBe(EDUCATION_COLLECTION.name);
      expect(post.excerpt.length).toBeGreaterThan(80);
    }
  });

  it("matches each POSTS title to the article's question", () => {
    for (const article of EDUCATION_ARTICLES) {
      const post = educationPosts().find((p) => p.slug === article.slug)!;
      expect(post.title).toBe(article.question);
    }
  });

  it("does not collide with the collection index route", () => {
    // `app/blog/mua-nha-bang-con-so/page.tsx` is a static segment; an entry
    // with that slug in POSTS would make the dynamic route try to build it too.
    expect(POSTS.some((p) => p.slug === "mua-nha-bang-con-so")).toBe(false);
  });

  it("points every exercise at a live calculator", () => {
    const live = new Set(liveCalculators().map((c) => c.slug));
    for (const article of EDUCATION_ARTICLES) {
      expect(live.has(article.exercise.toolSlug), article.slug).toBe(true);
    }
  });
});
