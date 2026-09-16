import { describe, it, expect } from "vitest";
import {
  filterTools,
  foldVietnamese,
  matchesQuery,
  queryTokens,
  type SearchableTool,
} from "@/lib/calc/tool-search";
import {
  CALCULATORS,
  CATEGORY_LABELS,
} from "@/content/calculators/registry";
import { dispositionFor } from "@/content/calculators/plan-disposition";
import { CALCULATOR_HUB } from "@/content/calculators/hub";

/**
 * The real catalogue, built the way the hub builds it.
 *
 * Testing against a three-item fixture would prove the filter compiles and
 * nothing about whether a buyer can find anything: the interesting failures
 * are "this query returns all 75" and "this query returns none", and both
 * need the real data.
 */
const CATALOGUE: SearchableTool[] = CALCULATORS.map((calc) => {
  const disposition = dispositionFor(calc.slug);
  if (!disposition) throw new Error(`no disposition for ${calc.slug}`);
  return {
    slug: calc.slug,
    title: calc.title,
    summary: calc.summary,
    question: disposition.question,
    categoryLabel: CATEGORY_LABELS[calc.category],
  };
});

const slugsFor = (query: string) =>
  filterTools(CATALOGUE, query).map((t) => t.slug);

describe("foldVietnamese", () => {
  it("strips tone marks and vowel modifiers", () => {
    expect(foldVietnamese("Khả năng mua nhà")).toBe("kha nang mua nha");
    expect(foldVietnamese("Lãi suất thả nổi")).toBe("lai suat tha noi");
    expect(foldVietnamese("Mục tiêu tiết kiệm")).toBe("muc tieu tiet kiem");
  });

  it("folds đ and Đ, which NFD does not decompose", () => {
    // The reason this function is not three lines of normalize+replace: "đ" is
    // an atomic letter, not d + a combining mark, so it survives NFD intact.
    expect(foldVietnamese("Đổi đơn vị")).toBe("doi don vi");
    expect(foldVietnamese("đồng")).toBe("dong");
  });

  it("leaves already-plain text alone", () => {
    expect(foldVietnamese("apr")).toBe("apr");
    expect(foldVietnamese("401k")).toBe("401k");
  });
});

describe("queryTokens", () => {
  it("splits on any run of whitespace and drops the empties", () => {
    expect(queryTokens("  vay   nha  ")).toEqual(["vay", "nha"]);
    expect(queryTokens("")).toEqual([]);
    expect(queryTokens("   ")).toEqual([]);
  });
});

describe("filterTools on the real 75-tool catalogue", () => {
  it("returns every tool for an empty query, in the original order", () => {
    // This is the state the hub PRERENDERS. If it were not the identity, the
    // server HTML and the first client render would differ.
    expect(slugsFor("")).toEqual(CALCULATORS.map((c) => c.slug));
    expect(slugsFor("   ")).toEqual(CALCULATORS.map((c) => c.slug));
  });

  it("does not mutate or alias the input array", () => {
    // The property is NON-MUTATION, so measure it: capture the length, mutate
    // the returned array, assert the source is unchanged.
    //
    // This asserted `toBe(75)` — the suite's own size — which docs §8 records
    // as a thing never to pin: a legitimately added calculator would have
    // turned an aliasing test red with a message about the wrong subject
    // entirely. The literal was only ever a stand-in for "unchanged".
    const before = CATALOGUE.length;
    const result = filterTools(CATALOGUE, "");
    expect(result).not.toBe(CATALOGUE);
    result.pop();
    expect(CATALOGUE.length).toBe(before);
    // Non-vacuous: the pop must really have shortened the copy, or an
    // implementation returning a frozen empty array would pass.
    expect(result.length).toBe(before - 1);
  });

  it("finds a tool from unaccented typing", () => {
    expect(slugsFor("kha nang mua nha")).toEqual(["kha-nang-mua-nha"]);
    expect(slugsFor("doi don vi")).toEqual(["doi-don-vi"]);
  });

  it("finds a tool by its accented name too", () => {
    expect(slugsFor("Khả năng mua nhà")).toEqual(["kha-nang-mua-nha"]);
  });

  it("finds a tool by the buyer's question, not just its title", () => {
    // "hết ưu đãi" appears in neither the title nor the summary of the
    // floating-rate tool. This is the whole reason the disposition's question
    // is part of the haystack.
    const results = slugsFor("het uu dai");
    expect(results).toContain("lai-suat-tha-noi");

    const shock = slugsFor("chiu noi khoan tra moi");
    expect(shock).toEqual(["lai-suat-tha-noi"]);
  });

  it("finds a tool by its slug, which is what the URL bar remembers", () => {
    expect(slugsFor("quy tac 72")).toContain("quy-tac-72");
    expect(slugsFor("apr nang cao")).toContain("apr-nang-cao");
  });

  it("ANDs the tokens rather than ORing them", () => {
    // "vay" alone is broad; adding "xe" must narrow it, not widen it.
    const broad = slugsFor("vay");
    const narrow = slugsFor("vay xe");
    expect(broad.length).toBeGreaterThan(narrow.length);
    for (const slug of narrow) expect(broad).toContain(slug);
    expect(narrow).toContain("vay-mua-xe");
  });

  it("narrows monotonically as the user keeps typing", () => {
    // Every prefix of a query must return a superset of the longer query's
    // results, or the list would jump around under the user's fingers.
    const steps = ["l", "la", "lai", "lai su", "lai suat", "lai suat tha noi"];
    for (let i = 1; i < steps.length; i += 1) {
      const wider = new Set(slugsFor(steps[i - 1]));
      for (const slug of slugsFor(steps[i])) {
        expect(wider.has(slug), `"${steps[i]}" escaped "${steps[i - 1]}"`).toBe(
          true,
        );
      }
    }
  });

  it("returns nothing, not everything, for a query that matches no tool", () => {
    // The failure mode worth guarding: a filter bug that falls back to the
    // full list looks like a working search and hides the empty state the hub
    // has to explain.
    expect(slugsFor("xyzzy khong co cong cu nao")).toEqual([]);
  });

  it("matches the section name, because people search by category", () => {
    const results = slugsFor("chung khoan");
    expect(results.length).toBeGreaterThan(5);
    for (const slug of results) {
      const entry = CALCULATORS.find((c) => c.slug === slug);
      expect(entry).toBeDefined();
    }
  });

  it("matches a library label when one is supplied", () => {
    // The fixture uses a SHIPPED label. It used to say "Thư viện Hoa Kỳ",
    // which no `CALCULATOR_HUB.libraryLabels` value has ever contained — so this test
    // proved `matchesQuery` can match the words "thư viện" while no real tool
    // carries them, and a reader typing that gets nothing. A fixture richer
    // than the data asserts a capability the product does not have.
    const shelved: SearchableTool = {
      slug: "thue-luong-hoa-ky",
      title: "Thuế lương Hoa Kỳ",
      summary: "",
      question: "Thuế lương FICA ở Hoa Kỳ gồm những gì?",
      categoryLabel: "Khác",
      libraryLabel: CALCULATOR_HUB.libraryLabels["hoa-ky"],
    };
    expect(matchesQuery(shelved, "hoa ky")).toBe(true);
    // And prove the LABEL is what matched, which needs every other field
    // cleared of the term — including the SLUG. My first attempt cleared only
    // the title and question and still matched, because `thue-luong-hoa-ky`
    // contains "hoa-ky" and the slug is part of the haystack (see "finds a
    // tool by its slug" above). An assertion about which field matched has to
    // account for all of them.
    const labelOnly: SearchableTool = {
      slug: "thue-luong",
      title: "Thuế lương",
      summary: "",
      question: "Thuế lương FICA gồm những gì?",
      categoryLabel: "Khác",
      libraryLabel: CALCULATOR_HUB.libraryLabels["hoa-ky"],
    };
    expect(matchesQuery(labelOnly, "hoa ky")).toBe(true);
    expect(matchesQuery({ ...labelOnly, libraryLabel: undefined }, "hoa ky")).toBe(
      false,
    );
  });

  it("records that no shipped library label contains the word thư viện", () => {
    // Not a defect assertion — a recorded gap. `CALCULATOR_HUB.libraryLegend` explains
    // the badges using the phrase "thư viện tham khảo", so a reader who reads
    // the legend and then searches the word gets zero results. Fixing it means
    // changing the five rendered badges, which is a product decision, not a
    // test fix. Asserted so the gap cannot be mistaken for working behaviour,
    // and so whoever changes the labels gets a red test pointing here.
    const labels = Object.values(CALCULATOR_HUB.libraryLabels);
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.toLowerCase()).not.toContain("thư viện");
    }
    expect(CALCULATOR_HUB.libraryLegend.toLowerCase()).toContain("thư viện");
  });

  it("keeps every tool reachable by at least one plausible query", () => {
    // A catalogue entry nothing can find is worse than one that is missing:
    // it is in the sitemap, it has a URL, and the hub's own search hides it.
    // The plausible query used here is the tool's own title, folded — the
    // weakest possible claim, and it still caught nothing only because the
    // haystack includes the title.
    for (const tool of CATALOGUE) {
      const found = slugsFor(tool.title);
      expect(found, `"${tool.title}" finds nothing`).toContain(tool.slug);
    }
  });
});

/**
 * PRECISION, which this file asserted nowhere before 2026-09-16.
 *
 * Everything above tests RECALL — that a query finds what it should. Every one
 * of those assertions is a `toContain` or a superset check, and all of them
 * pass happily on a result set padded with nonsense. The hub was driven in a
 * browser and `het uu dai` returned three tools: the floating-rate loan plus
 * two retirement tools, because folding turns "hưu trí" into "huu tri" and the
 * old matcher asked only whether the haystack CONTAINED "uu".
 *
 * So these tests assert the other half: that a result set contains nothing it
 * should not, and that a short token cannot reach inside a longer word.
 */
describe("filterTools precision, not just recall", () => {
  it("does not let a short token reach inside a longer word", () => {
    // The exact defect. "hưu trí" folds to "huu tri", which CONTAINS "uu" —
    // so every retirement tool used to answer a query containing that token.
    const retirement = CATALOGUE.filter((t) => t.slug.includes("huu-tri"));
    expect(retirement.length, "no retirement tool in the catalogue").toBeGreaterThan(2);
    for (const tool of retirement) {
      expect(
        matchesQuery(tool, "uu"),
        `"uu" still reaches inside a word in ${tool.slug}`,
      ).toBe(false);
    }
    // Non-vacuity: the token DOES match where "ưu" is its own word.
    const floating = CATALOGUE.find((t) => t.slug === "lai-suat-tha-noi")!;
    expect(matchesQuery(floating, "uu")).toBe(true);
  });

  it("answers the query that exposed the bug with only the right tool", () => {
    // Measured in the browser before the fix: 3 of 75. The two extras were
    // `can-danh-bao-nhieu-cho-dai-han` and `von-dai-han-tieu-duoc-bao-nhieu`,
    // both matched through "huu" and "dài".
    expect(slugsFor("het uu dai")).toEqual(["lai-suat-tha-noi"]);
  });

  it("holds the rule for every result of every query it answers", () => {
    // The property, rather than a list of cases: each token of a query must
    // begin at a word start in the tool that was returned. `[^a-z0-9]` is the
    // boundary because the haystack is folded to unaccented lower case.
    const queries = [
      "kha nang mua nha",
      "het uu dai",
      "lai suat tha noi",
      "chung khoan",
      "vay xe",
      "quy tac 72",
      "tiet kiem",
    ];
    let asserted = 0;
    for (const query of queries) {
      const results = filterTools(CATALOGUE, query);
      expect(results.length, `"${query}" found nothing`).toBeGreaterThan(0);
      for (const tool of results) {
        const text = foldVietnamese(
          [tool.title, tool.summary, tool.question, tool.categoryLabel,
           tool.libraryLabel ?? "", tool.slug.replace(/-/g, " ")].join(" "),
        );
        for (const token of queryTokens(query)) {
          const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          expect(
            new RegExp(`(?:^|[^a-z0-9])${escaped}`).test(text),
            `"${query}" returned ${tool.slug}, where "${token}" is not at a word start`,
          ).toBe(true);
          asserted += 1;
        }
      }
    }
    // A loop over queries that matched nothing would pass silently.
    expect(asserted).toBeGreaterThan(40);
  });

  it("still narrows monotonically, which is what forbids whole-word matching", () => {
    // Word-START matching is chosen over whole-word precisely so that a reader
    // mid-word keeps getting results. If this ever regresses to whole-word,
    // the single-letter step is what goes red first.
    for (const step of ["l", "la", "lai", "lai s", "lai su"]) {
      expect(slugsFor(step).length, `"${step}" found nothing mid-typing`).toBeGreaterThan(0);
    }
    expect(slugsFor("lai suat tha noi")).toContain("lai-suat-tha-noi");
  });
});
