import { describe, it, expect } from "vitest";
import {
  TOOL_DISPOSITIONS,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { IRR_NPV } from "@/content/calculators/irr-npv";
import { BOND } from "@/content/calculators/bond";
import { STOCK_RETURN } from "@/content/calculators/stock-return";
import { DDM } from "@/content/calculators/ddm";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { CAPM } from "@/content/calculators/capm";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";
import { HOLDING_PERIOD } from "@/content/calculators/holding-period";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";
import { PIVOT } from "@/content/calculators/pivot";
import { FIBONACCI } from "@/content/calculators/fibonacci";

/**
 * The investing shelf's shared copy contracts — the eleven `dau-tu` rows.
 *
 * WHY ONE FILE RATHER THAN ELEVEN COPIES. These assertions are about a
 * property every row on the shelf owes, not about any row's figures; those
 * live in each row's own content test. Written per row this would be eleven
 * near-identical blocks, and the eleventh would be the one that never got
 * updated.
 *
 * The shelf is DERIVED from `TOOL_DISPOSITIONS`, never listed: a twelfth
 * `dau-tu` row fails the wiring check below with its slug named, which is
 * the failure you want — a hand-written list would just quietly not cover
 * it. (docs §8, "never pin the suite's own size": the count is asserted
 * against the data, not against a literal.)
 */

/** slug -> the row's content module. Every `dau-tu` row must appear. */
const SHELF: Record<string, unknown> = {
  "irr-npv": IRR_NPV,
  "trai-phieu": BOND,
  "loi-nhuan-co-phieu": STOCK_RETURN,
  "co-phieu-tang-truong-deu": DDM,
  "co-phieu-tang-truong-khong-deu": DDM_MULTI,
  capm: CAPM,
  "loi-nhuan-ky-vong": EXPECTED_RETURN,
  "loi-nhuan-ky-nam-giu": HOLDING_PERIOD,
  "quyen-chon-black-scholes": BLACK_SCHOLES,
  "diem-pivot": PIVOT,
  fibonacci: FIBONACCI,
};

const shelfSlugs = () =>
  TOOL_DISPOSITIONS.filter((d) => d.library === "dau-tu").map((d) => d.slug);

/**
 * Proper nouns and initialisms a reader cannot mistake for shouting.
 *
 * Every entry is a term that exists only in capitals: none of them is a
 * Vietnamese word being emphasised. Kept deliberately short — the point of
 * the sweep is that a word like "VĨNH VIỄN" or "MỆNH GIÁ" is NOT on it.
 */
const PROPER_NOUNS = [
  "IRR",
  "NPV",
  "MIRR",
  "CAPM",
  "WACC",
  "YTM",
  "GDP",
  "HOSE",
  "USD",
  "ROI",
  // The index, named. Listed in full rather than as a bare "VN" so a
  // genuinely shouted two-letter word could not hide behind it.
  "VN-Index",
];

/**
 * Every user-facing string in a content module, by WALKING the object.
 *
 * Deliberately not a hand-written field list and deliberately not a regex
 * over the source text. A field list goes stale the moment a field is added
 * — `relatedTool`, `noSignalNotice` and `directionDetail` all arrived after
 * these modules shipped — and pulling the literals out with a source regex
 * first is what made an earlier sweep of this shelf report zero shouted
 * words on files that were full of them.
 */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value))
    for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/**
 * A legal instrument's designation — "109/2025/QH15", "253/2026/NĐ-CP".
 *
 * Stripped as a PATTERN rather than by adding each number to `PROPER_NOUNS`,
 * because the initialism is the tail of a document number and a new citation
 * brings its own: a row citing a circular would need "TT-BTC" added by hand,
 * and the person adding it would be reading a failure that says its copy
 * shouts. The whole designation goes, not the letters alone, so a genuinely
 * shouted word standing next to a citation is still reported — asserted
 * below.
 *
 * This became load-bearing when `loi-nhuan-co-phieu` dated its two prefilled
 * statutory rates: the `{2,}` word rule reports "QH" out of "109/2025/QH15"
 * and "NĐ" and "CP" out of "253/2026/NĐ-CP", none of which a reader can
 * mistake for emphasis. (`business-forecast.test.ts` never hit this because
 * its own sweep is `{3,}`, which is the hole this shelf's rule closed.)
 */
const INSTRUMENT_NUMBER = /\d+\/\d{4}\/[\p{Lu}\d-]+/gu;

/**
 * Whole words in capitals, once the proper nouns are removed.
 *
 * WHOLE WORDS, not runs of three letters, and that is the second version.
 * A `\p{Lu}{3,}` sweep is what the US shelf used, and on this shelf it read
 * as clean over three lines that were shouting in two-letter words:
 * "Nhập số ÂM cho tiền bỏ ra", "Công cụ CỐ Ý không tự chuẩn hóa" and "rủi
 * ro ÍT hơn trên mỗi đơn vị lợi nhuận". Vietnamese is full of two-letter
 * words, so a three-letter minimum is a hole the size of the language.
 *
 * The bound is a WORD boundary rather than a length, which also stops the
 * looser rule from reporting the "IR" inside a mixed-case identifier.
 */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    let text = original;
    // split/join, not a regex: some of these tokens could carry regex
    // metacharacters, and this loop should not care which.
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    text = text.replace(INSTRUMENT_NUMBER, " ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ`: that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean
    // while every shouted word is still on the page.
    for (const match of text.matchAll(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu))
      found.push(match[0]);
  }
  return [...new Set(found)];
}

describe("the dau-tu shelf is wired into this sweep", () => {
  it("covers every dau-tu row, with none left over", () => {
    expect(Object.keys(SHELF).sort()).toEqual(shelfSlugs().sort());
  });

  it("is the shelf this unit owns — eleven rows, derived", () => {
    // Not `toBe(11)`: the assertion is that the shelf and the map agree,
    // which the test above already makes. This one records that the shelf
    // is non-trivial, so an empty `dau-tu` filter cannot make the sweep
    // vacuous while both checks stay green.
    expect(shelfSlugs().length).toBeGreaterThan(5);
  });
});

describe("no page on the investing shelf shouts mid-sentence", () => {
  it("fires on lines these modules really shipped", () => {
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. All four fixtures are real: the first two are lines from
    // this shelf before this pass, the third is a line that must stay
    // clean, and the fourth proves the allowlist does not swallow a shout
    // standing next to an initialism.
    expect(
      shoutedRuns(["Tốc độ tăng trưởng VĨNH VIỄN. Phải nhỏ hơn lợi nhuận yêu cầu."]),
    ).toEqual(["VĨNH", "VIỄN"]);
    expect(shoutedRuns(["Tính trên MỆNH GIÁ, không phải trên giá mua."])).toEqual([
      "MỆNH",
      "GIÁ",
    ]);
    expect(shoutedRuns(["Hãy đọc NPV trước, không phải IRR."])).toEqual([]);
    expect(shoutedRuns(["Dùng MIRR nếu KHÔNG cần một con số tỷ lệ."])).toEqual([
      "KHÔNG",
    ]);
    // The two-letter case, which is why this is a word rule and not a
    // three-letter one. Both of these are lines this shelf shipped.
    expect(shoutedRuns(["Nhập số ÂM cho tiền bỏ ra."])).toEqual(["ÂM"]);
    // "CỐ" is reported; the one-letter "Ý" beside it is not, and that is
    // the rule's stated edge — a single capital letter standing alone is as
    // likely to be a name (Ý is also Italy) as an emphasis, so the sweep
    // does not judge it. Both words were fixed by hand here.
    expect(shoutedRuns(["Công cụ CỐ Ý không tự chuẩn hóa"])).toEqual(["CỐ"]);
    // And the allowlist still clears a named index.
    expect(shoutedRuns(["ví dụ của VN-Index trong dài hạn"])).toEqual([]);
    // The instrument strip, both directions. A dated citation is clean —
    // this is a line row 38 ships — and it does NOT swallow a shout beside
    // one, which is the whole reason the designation is stripped as a unit
    // rather than "QH", "NĐ" and "CP" being allowlisted as words.
    expect(
      shoutedRuns([
        "Điều 13 khoản 2 Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, chi tiết ở Điều 54 Nghị định 253/2026/NĐ-CP",
      ]),
    ).toEqual([]);
    expect(
      shoutedRuns(["Nghị định 253/2026/NĐ-CP KHÔNG áp cho phái sinh"]),
    ).toEqual(["KHÔNG"]);
  });

  it("sweeps every string on every row of the shelf", () => {
    for (const [slug, content] of Object.entries(SHELF)) {
      const shouted = shoutedRuns(userFacingStrings(content));
      expect(
        shouted,
        `${slug} shouts mid-sentence: ${shouted.join(" / ")}`,
      ).toEqual([]);
    }
  });
});

describe("the investing shelf's emphasis is applied, not just filed", () => {
  it("declares phrases that occur, on every row of the shelf", () => {
    // THIS BLOCK WAS THE INVERSE. It asserted that no row on this shelf
    // declared emphasis, because all eleven were filed `reference` — and
    // `scripts/check-built-markup.mjs` fails a page shipping `<strong>`
    // while not filed `emphasis`. That made arrays-first red.
    //
    // The filing has now moved. What made that safe is that it moved in ONE
    // change with the arrays, because the same script fails the other
    // direction too — "filed as `emphasis` but the page ships no
    // `<strong>`". So the pair has no safe ordering, only a safe atomic
    // commit, and `check:markup` passing is what proves it was atomic.
    //
    // `plan-disposition.test.ts` now also sweeps these rows through
    // `CALCULATOR_PROSE`. This block stays because it is the SHELF-level
    // statement: it fails with a slug named if a twelfth `dau-tu` row
    // arrives filed `emphasis` with no phrases, which the suite-wide sweep
    // would report against a slug nobody associates with this unit.
    for (const [slug, content] of Object.entries(SHELF)) {
      expect(readingDispositionFor(slug)).toBe("emphasis");
      const prose = (content as {
        formula: { body: readonly string[]; emphasis?: readonly string[] };
      }).formula;
      expect(
        prose.emphasis?.length ?? 0,
        `${slug} is filed emphasis but declares no phrases`,
      ).toBeGreaterThan(0);
      const missing = missingPhrases(prose.body, prose.emphasis ?? []);
      expect(
        missing,
        `${slug} declares phrases that do not occur: ${missing.join(" / ")}`,
      ).toEqual([]);
    }
  });

  it("keeps every row's share under the ratchet, and reports it", () => {
    // The landed acquisition rows sit at 6,2-13,6%. This shelf comes in
    // LOWER, at roughly 2-8%, and that is the honest figure rather than a
    // gap to pad: these pages are mostly formula derivations, so there are
    // fewer distinctions to mark than on a page making an argument.
    for (const [slug, content] of Object.entries(SHELF)) {
      const prose = (content as {
        formula: { body: readonly string[]; emphasis?: readonly string[] };
      }).formula;
      const share = emphasisShare(prose.body, prose.emphasis ?? []);
      expect(
        share,
        `${slug} emphasises ${(share * 100).toFixed(1)}% of its method`,
      ).toBeLessThan(0.2);
      // And it is not vacuous: a row that declared an empty list would pass
      // the ceiling trivially.
      expect(share, `${slug} emphasises nothing`).toBeGreaterThan(0);
    }
  });

  it("marks no phrase twice, and never wraps a capital", () => {
    for (const [slug, content] of Object.entries(SHELF)) {
      const prose = (content as {
        formula: { body: readonly string[]; emphasis?: readonly string[] };
      }).formula;
      for (const phrase of prose.emphasis ?? []) {
        const paragraphs = prose.body.filter((p) => p.includes(phrase));
        expect(
          paragraphs,
          `${slug}: "${phrase}" occurs in ${paragraphs.length} paragraphs`,
        ).toHaveLength(1);
        // The phrases REPLACE the capitals rather than wrapping them: a
        // phrase that still shouted would put <strong> around a shouted
        // word and keep both mechanisms. This is the same sweep as above,
        // pointed at the phrase list itself.
        expect(
          shoutedRuns([phrase]),
          `${slug}: the phrase "${phrase}" still contains capitals`,
        ).toEqual([]);
      }
    }
  });
});
