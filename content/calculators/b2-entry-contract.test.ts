/**
 * THE ENTRY CONTRACT, ASSERTED ACROSS THE WHOLE INVESTING SHELF.
 *
 * `README.md`'s global requirement for a calculator's first screen is one
 * purpose sentence plus a short critical limit, with explanatory detail moved
 * behind a labelled disclosure. `components/calc/calculator-page.tsx` already
 * owns the mechanism — `ledeDetail`/`ledeDetailTitle` on the heading and
 * `noticeDetail`/`noticeDetailTitle` under the notice — and its own docstring
 * states the rule this file enforces: "Keep it to one or two sentences. A
 * critical limitation has to stay VISIBLE […] the full version goes in
 * `noticeDetail`."
 *
 * WHY A SHARED FILE AND NOT SEVENTEEN. The defect this pass repaired was
 * uniform: every route had the sentence a reader needs, and most of them had
 * three or four more above the first input. A per-route assertion would let
 * the next route regress quietly, which is how the shelf reached this state.
 *
 * WHAT IS DELIBERATELY *NOT* ASSERTED HERE: any pixel or viewport claim.
 * Nothing in this suite renders at a width (AGENTS.md), so the bound below is
 * a RATCHET against today's measured worst case, not a statement about where
 * a form lands on a phone. The measured first-input positions that motivated
 * the repair live in the audit artifacts and were taken in a browser.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";
import { BOND } from "@/content/calculators/bond";
import { CAPM } from "@/content/calculators/capm";
import { DDM } from "@/content/calculators/ddm";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { EDUCATION_SAVINGS } from "@/content/calculators/education-savings";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";
import { FIBONACCI } from "@/content/calculators/fibonacci";
import { FUND_FEES } from "@/content/calculators/fund-fees";
import { HOLDING_PERIOD } from "@/content/calculators/holding-period";
import { IRR_NPV } from "@/content/calculators/irr-npv";
import { PIVOT } from "@/content/calculators/pivot";
import { ROI } from "@/content/calculators/roi";
import { STOCK_RETURN } from "@/content/calculators/stock-return";
import { TAX_EQUIVALENT } from "@/content/calculators/tax-equivalent";
import { WACC } from "@/content/calculators/wacc";
import { WITHDRAWAL } from "@/content/calculators/withdrawal";

const ROUTES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../app/cong-cu",
);

/**
 * Which content key a route hands to a shell slot, read from the route source.
 *
 * Same contract as `content/calculators/investing-notices.test.ts`: a string
 * that exists in a content module proves nothing about what the page renders,
 * and re-pointing `notice` at a shorter field is exactly the silent demotion
 * these assertions are here to catch.
 */
function slotKey(slug: string, slot: string): string | null {
  const source = readFileSync(`${ROUTES}/${slug}/page.tsx`, "utf8");
  const match = new RegExp(`\\b${slot}=\\{C\\.([A-Za-z0-9_.]+)\\}`).exec(source);
  return match ? match[1] : null;
}

function slotText(
  content: unknown,
  slug: string,
  slot: string,
): string | null {
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
 * Sentence count, borrowed verbatim from `content/calculators/points.test.ts`.
 *
 * A period must be followed by whitespace or end-of-string, which is what
 * makes it safe on Vietnamese grouped numbers: "778.268.627" is one token,
 * not three sentences.
 */
const sentences = (text: string) =>
  text.split(/[.!?](?:\s|$)/).filter(Boolean).length;

/**
 * Every live route on the investing shelf, with what its first screen owes.
 *
 * `visible` — the critical market/tax/model/applicability limits that must
 * stay in `lede` or `notice`, where no click is required. `moved` — the
 * teaching and worked figures this pass relocated, which must still be on the
 * page, inside a disclosure the route actually passes. A route with an empty
 * `moved` array moved nothing: its notice is critical limits end to end, so
 * it was tightened in place instead.
 */
const SHELF = [
  {
    slug: "ty-suat-loi-nhuan-roi",
    content: ROI,
    visible: ["ROI tổng không nói gì về thời gian"],
    moved: ["500 triệu thành 700 triệu sau 3 năm", "65,7%/năm", "4,3%/năm"],
  },
  {
    slug: "irr-npv",
    content: IRR_NPV,
    visible: ["Hãy đọc NPV trước", "tái đầu tư", "không duy nhất"],
    moved: ["15,2382%", "12,8659%"],
  },
  {
    // Nothing moved: every clause is the default-risk limit itself.
    slug: "trai-phieu",
    content: BOND,
    visible: ["không tính rủi ro vỡ nợ", "nếu bạn thực sự nhận được tiền"],
    moved: [],
  },
  {
    slug: "loi-suat-tuong-duong-thue",
    content: TAX_EQUIVALENT,
    visible: ["BỊ KHẤU TRỪ THUẾ", "rủi ro tín dụng"],
    moved: ["TIỀN ĐANG CHỜ MUA NHÀ", "5,789474%"],
  },
  {
    slug: "tiet-kiem-hoc-phi",
    content: EDUCATION_SAVINGS,
    visible: ["ẢNH HƯỞNG LỚN", "cách tính thừa"],
    moved: ["778.268.627", "700.601.379"],
  },
  {
    slug: "thu-nhap-dau-tu",
    content: WITHDRAWAL,
    visible: ["không phải thu nhập được bảo đảm", "THEO GIẢ ĐỊNH"],
    moved: ["15.749.891", "245 tháng"],
  },
  {
    slug: "phi-quy-dau-tu",
    content: FUND_FEES,
    visible: ["tính trên TÀI SẢN"],
    moved: ["1.066.857.503", "35,99%"],
  },
  {
    // Nothing moved out of the notice: it is the statute, the date, the base
    // and the sell-at-a-loss consequence. The lede was tightened instead.
    slug: "loi-nhuan-co-phieu",
    content: STOCK_RETURN,
    visible: ["01/07/2026", "109/2025/QH15", "không được trừ giá vốn"],
    moved: [],
  },
  {
    slug: "co-phieu-tang-truong-deu",
    content: DDM,
    visible: ["đừng đọc con số giá trị như một kết luận"],
    moved: ["3,704%", "220.000"],
  },
  {
    slug: "co-phieu-tang-truong-khong-deu",
    content: DDM_MULTI,
    visible: ["không ai kiểm chứng được"],
    moved: ["77,41%", "12.358"],
  },
  {
    slug: "capm",
    content: CAPM,
    visible: ["đều là ước lượng", "đừng dùng nó như một dự báo"],
    moved: ["6%, 8%, 10%"],
  },
  {
    slug: "loi-nhuan-ky-vong",
    content: EXPECTED_RETURN,
    visible: ["Hệ số biến thiên"],
    moved: ["14,3614%", "1,9149"],
  },
  {
    slug: "loi-nhuan-ky-nam-giu",
    content: HOLDING_PERIOD,
    visible: ["không phải dòng tổng"],
    moved: ["18% lãi vốn", "12% lợi tức"],
  },
  {
    slug: "wacc",
    content: WACC,
    visible: ["chỉ áp cho nợ", "chỉ lãi vay được trừ thuế"],
    moved: ["11,96%", "12,5%"],
  },
  {
    // Nothing moved: model assumption, risk-neutral caveat and the
    // continuous-compounding unit rule are all applicability limits. The
    // Greeks teaching left the ENTRY slots entirely — it now renders beside
    // the Greeks table (`components/black-scholes-calculator.tsx`).
    slug: "quyen-chon-black-scholes",
    content: BLACK_SCHOLES,
    visible: [
      "không phải giá đang giao dịch",
      "trung tính rủi ro",
      "ghép liên tục",
    ],
    moved: [],
  },
  {
    slug: "diem-pivot",
    content: PIVOT,
    visible: ["không dự đoán gì", "không phải về giá trị của tài sản"],
    moved: ["bốn bộ số khác nhau"],
  },
  {
    // `directionDetail` predates this pass; the notice was tightened in
    // place, under the row-41 bound `investing-notices.test.ts` derives.
    slug: "fibonacci",
    content: FIBONACCI,
    visible: ["không bảo đảm", "không phải giá trị của tài sản"],
    moved: [],
  },
] as const;

/**
 * The regression ceiling on visible entry text, in characters.
 *
 * DERIVED, not chosen: it is today's worst case rounded up — row 42's
 * `quyen-chon-black-scholes` at 661, whose lede and notice are both
 * irreducible applicability limits. The point of the number is that no route
 * may grow past the one route that cannot shrink.
 */
const ENTRY_BUDGET = 700;

describe("the investing shelf's entry contract", () => {
  it("covers every route the milestone touched", () => {
    // Guards against a route being dropped from the table instead of fixed.
    expect(new Set(SHELF.map((r) => r.slug)).size).toBe(SHELF.length);
    expect(SHELF.length).toBe(17);
  });

  for (const row of SHELF) {
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
        if (row.moved.length === 0) return;
        // A detail with no summary line renders NOTHING in the shell, so the
        // pair is asserted together — see `calculator-page.tsx`.
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
