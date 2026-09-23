/**
 * THE ENTRY CONTRACT FOR THE E BATCH — the eight routes the E20 pass
 * implemented, plus the six E12 utilities a real-UI round found with their
 * worked examples still open above the first input.
 *
 * WHY A SHARED FILE AND NOT FOURTEEN: the same reason
 * `content/calculators/b2-entry-contract.test.ts` gives, and it is not a
 * hypothetical here. Every one of these routes had the sentence a reader
 * needs; most had three to six more, plus a worked example, before the first
 * numeric field. A per-route assertion lets the next route regress quietly.
 *
 * THE MECHANISM IS THE SHELL'S. `components/calc/calculator-page.tsx` owns
 * `ledeDetail`/`ledeDetailTitle` and `noticeDetail`/`noticeDetailTitle`, and
 * renders a detail ONLY when its title is present too — so the pair is
 * asserted together. A detail with no summary line renders nothing at all.
 *
 * WHAT IS DELIBERATELY *NOT* ASSERTED HERE: any pixel or viewport claim.
 * Nothing in this suite renders at a width (AGENTS.md), so `ENTRY_BUDGET` is a
 * RATCHET against today's measured worst case, not a statement about where a
 * form lands on a phone. The first-input positions that motivated the repair
 * were measured in a browser and live in the audit artifacts.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { ANNUITY } from "@/content/calculators/annuity";
import { ASSET_ALLOCATION } from "@/content/calculators/asset-allocation";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";
import { CARD_MINIMUM } from "@/content/calculators/card-minimum";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import { EFFECTIVE_RATE } from "@/content/calculators/effective-rate";
import { FINANCIAL_RATIOS } from "@/content/calculators/financial-ratios";
import { FUEL } from "@/content/calculators/fuel";
import { MARGIN } from "@/content/calculators/margin";
import { NET_DISTRIBUTION } from "@/content/calculators/net-distribution";
import { RETIREMENT_INCOME_ANALYSIS } from "@/content/calculators/retirement-income-analysis";
import { STATEMENT_ANALYSIS } from "@/content/calculators/statement-analysis";
import { TIP } from "@/content/calculators/tip";
import { UNITS_CONTENT } from "@/content/calculators/units";

const ROUTES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../app/cong-cu",
);

/**
 * Which content key a route hands to a shell slot, read from the route source.
 *
 * Same contract as `b2-entry-contract.test.ts`: a string that exists in a
 * content module proves nothing about what the page renders, and re-pointing
 * `notice` at a shorter field is exactly the silent demotion these assertions
 * are here to catch.
 */
function slotKey(slug: string, slot: string): string | null {
  const source = readFileSync(`${ROUTES}/${slug}/page.tsx`, "utf8");
  const match = new RegExp(`\\b${slot}=\\{C\\.([A-Za-z0-9_.]+)\\}`).exec(source);
  return match ? match[1] : null;
}

function slotText(content: unknown, slug: string, slot: string): string | null {
  const key = slotKey(slug, slot);
  if (key === null) return null;
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown>)[part],
      content,
    );
  if (typeof value !== "string")
    throw new Error(`${slug}: ${slot} does not resolve to a string`);
  return value;
}

/**
 * Sentence count, borrowed verbatim from `points.test.ts` via the B2 file.
 *
 * A period must be followed by whitespace or end-of-string, which is what
 * makes it safe on Vietnamese grouped numbers and on "sào 360 m² / mẫu
 * 3.600 m²": "43.091.470" is one token, not three sentences.
 */
const sentences = (text: string) =>
  text.split(/[.!?](?:\s|$)/).filter(Boolean).length;

/**
 * The fourteen routes, with what each first screen owes.
 *
 * `visible` — the limits, scope and warnings that must stay in `lede` or
 * `notice`, where no click is required. Each entry is taken from the repair
 * brief's per-route preservation list, not invented here. `moved` — the worked
 * figures and teaching this pass relocated, which must still be on the page
 * inside a disclosure the route actually passes.
 */
const BATCH = [
  {
    slug: "chi-phi-nhien-lieu",
    content: FUEL,
    visible: ["chi phí NHIÊN LIỆU", "không phải chi phí đi lại"],
    moved: ["khấu hao", "phí đỗ xe", "chi phí một chuyến"],
  },
  {
    slug: "phan-phoi-rong",
    content: NET_DISTRIBUTION,
    visible: [
      "GIẢ ĐỊNH do bạn nhập",
      "không phải cam kết về số tiền bạn sẽ được giải ngân",
      "Nghĩa vụ trả lãi và gốc vẫn là số NỢ GỐC",
    ],
    moved: ["không cộng dồn lên nhau", "khoản vay bị trừ phí khi giải ngân"],
  },
  {
    slug: "phan-tich-thu-nhap-huu-tri",
    content: RETIREMENT_INCOME_ANALYSIS,
    // The market and the currency decide whether the page applies at all; the
    // nominal/real distinction and the depletion risk are its conclusions.
    visible: ["Hoa Kỳ", "USD", "danh nghĩa", "cạn"],
    moved: ["82,5%", "56,6%", "9.241"],
  },
  {
    slug: "phan-bo-tai-san",
    content: ASSET_ALLOCATION,
    visible: ["quỹ dự phòng", "mười năm nữa", "không phải tư vấn đầu tư"],
    moved: ["chưa được phân bổ", "không nên chịu rủi ro"],
  },
  {
    slug: "nien-kim",
    content: ANNUITY,
    visible: ["Hoa Kỳ", "USD", "KHÔNG phải lợi suất", "bảo đảm"],
    moved: ["250.000 USD", "18.908", "13,2", "7,46%"],
  },
  {
    slug: "du-bao-kinh-doanh",
    content: BUSINESS_FORECAST,
    visible: ["giả định, không phải dữ liệu", "xảy ra nếu"],
    moved: ["15%/năm", "60% doanh thu", "8%/năm", "đòn bẩy hoạt động"],
  },
  {
    slug: "cac-chi-so-tai-chinh",
    content: FINANCIAL_RATIOS,
    visible: ["Một chỉ số không kết luận được", "dấu gạch ngang"],
    moved: ["19,2%", "0,8", "số dư cuối kỳ"],
  },
  {
    slug: "phan-tich-bao-cao-tai-chinh",
    content: STATEMENT_ANALYSIS,
    visible: ["hệ số nhân vốn chủ", "không phải tin tốt", "rủi ro tài chính"],
    moved: ["13,06%", "19,20%", "6,14", "17,63%"],
  },
  {
    slug: "lai-suat-thuc-te",
    content: EFFECTIVE_RATE,
    visible: ["KHÔNG phải APR", "không cộng phí"],
    moved: ["8,30%", "8,33%", "TỔNG CHI PHÍ"],
  },
  {
    slug: "margin-va-markup",
    content: MARGIN,
    visible: ["mẫu số khác nhau", "markup 50% chỉ là margin 33,33%"],
    moved: ["600.000 ₫", "840.000", "28,57%", "11,43"],
  },
  {
    slug: "doi-don-vi",
    content: UNITS_CONTENT,
    visible: [
      "buộc bạn chọn quy ước vùng",
      "không phải một chuẩn toàn quốc",
      "giấy chứng nhận",
    ],
    moved: ["360 m²", "499,95 m²", "gần 39%", "500 m²"],
  },
  {
    slug: "tra-het-the-tin-dung",
    content: CARD_PAYOFF,
    visible: ["MÔ HÌNH NÀY", "có thể tính khác"],
    moved: ["2,5305%", "điều khoản miễn lãi"],
  },
  {
    slug: "tra-toi-thieu-the-tin-dung",
    content: CARD_MINIMUM,
    visible: ["ví dụ minh họa", "biểu phí của thẻ bạn dùng"],
    moved: ["90 tháng", "43.091.470", "2.563.261", "28 tháng", "19.799.257"],
  },
  {
    slug: "tinh-tien-tip",
    content: TIP,
    visible: ["mặc định bằng 0", "Phí phục vụ và VAT là hai dòng riêng"],
    moved: ["15–20%", "không có tập quán tip"],
  },
] as const;

/**
 * The regression ceiling on visible entry text, in characters.
 *
 * DERIVED, NOT CHOSEN — and the derivation was run, not assumed. With the
 * budget temporarily set to 1, every route in the table reported its real
 * total: 282 (`du-bao-kinh-doanh`) at the low end, 531
 * (`tra-toi-thieu-the-tin-dung`) at the high end, with the rest between. 540
 * is that worst case rounded up, so it is tighter than the B2 shelf's 700 and
 * a route cannot drift back toward the pre-repair entries.
 *
 * WHY THE WORST CASE IS THE WORST CASE: `tra-toi-thieu-the-tin-dung` must keep
 * two independent things visible — the fixed-vs-minimum comparison that IS the
 * page, and the warning that both the minimum percentage and the floor are
 * illustrative rather than any real card's terms. Neither can move under a
 * disclosure without the page becoming misleading, so this route sets the
 * floor under the budget for the whole batch.
 */
const ENTRY_BUDGET = 540;

describe("the E batch's entry contract", () => {
  it("covers every route the pass touched", () => {
    // Guards against a route being dropped from the table instead of fixed.
    expect(new Set(BATCH.map((r) => r.slug)).size).toBe(BATCH.length);
    expect(BATCH.length).toBe(14);
  });

  for (const row of BATCH) {
    describe(row.slug, () => {
      const lede = slotText(row.content, row.slug, "lede");
      const notice = slotText(row.content, row.slug, "notice");

      it("renders both entry slots", () => {
        expect(lede, "no lede={C.…} in the route").toBeTruthy();
        expect(notice, "no notice={C.…} in the route").toBeTruthy();
      });

      it("keeps each entry slot to the shell's one-or-two sentences", () => {
        expect(sentences(lede!), `lede: ${lede}`).toBeLessThanOrEqual(2);
        expect(sentences(notice!), `notice: ${notice}`).toBeLessThanOrEqual(2);
      });

      it("stays inside the visible-entry ratchet", () => {
        const total = lede!.length + notice!.length;
        expect(
          total,
          `${row.slug} puts ${total} characters above the first input`,
        ).toBeLessThanOrEqual(ENTRY_BUDGET);
      });

      it("keeps its critical limits where no click is needed", () => {
        const visible = `${lede} ${notice}`;
        for (const limit of row.visible)
          expect(
            visible.includes(limit),
            `${row.slug}: "${limit}" left the visible entry slots`,
          ).toBe(true);
      });

      it("still carries what it moved, in a disclosure that renders", () => {
        const disclosures = (["ledeDetail", "noticeDetail"] as const)
          .filter((slot) => slotKey(row.slug, slot) !== null)
          .map((slot) => {
            expect(
              slotKey(row.slug, `${slot}Title`),
              `${row.slug}: ${slot} without ${slot}Title renders nothing`,
            ).toBeTruthy();
            return slotText(row.content, row.slug, slot)!;
          });
        expect(
          disclosures.length,
          `${row.slug} moved text out with no disclosure to put it in`,
        ).toBeGreaterThan(0);

        const detail = disclosures.join(" ");
        for (const figure of row.moved)
          expect(
            detail.includes(figure),
            `${row.slug}: "${figure}" was deleted rather than moved`,
          ).toBe(true);
      });
    });
  }
});
