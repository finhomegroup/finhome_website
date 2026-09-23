/**
 * THE ENTRY CONTRACT, ASSERTED ACROSS THE WHOLE US SHELF.
 *
 * Same contract and the same mechanism as
 * `content/calculators/b2-entry-contract.test.ts` — one purpose sentence plus
 * a short critical limit above the first input, with explanatory detail behind
 * `noticeDetail`/`noticeDetailTitle` in `components/calc/calculator-page.tsx`.
 * This file is the US-shelf twin, not a second idiom: `slotKey`, `slotText`
 * and `sentences` are the B2 helpers, so a reader who knows one knows both.
 *
 * WHY THE US SHELF NEEDS ITS OWN RATCHET. These thirteen routes carry a limit
 * B2's routes do not: the rules they implement are United States tax and
 * retirement law and do not apply in Vietnam. That warning is the one piece of
 * entry text that must never be shortened into a disclosure, so the `visible`
 * column below pins it per route — alongside the year/eligibility and
 * model-projection limits the milestone requires to stay unclicked.
 *
 * WHAT IS DELIBERATELY *NOT* ASSERTED HERE: any pixel or viewport claim.
 * Nothing in this suite renders at a width (AGENTS.md), so `ENTRY_BUDGET` is a
 * character ratchet against today's measured worst case, not a statement about
 * where a form lands on a phone. No route on this shelf has been observed in a
 * browser.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { liveCalculators } from "@/content/calculators/registry";
import { US_401K } from "@/content/calculators/us-401k";
import { US_401K_MAX } from "@/content/calculators/us-401k-max";
import { US_DIVIDEND_TAX } from "@/content/calculators/us-dividend-tax";
import { US_HSA } from "@/content/calculators/us-hsa";
import { US_INFLATION } from "@/content/calculators/us-inflation";
import { US_IRA } from "@/content/calculators/us-ira";
import { US_MORTGAGE_DEDUCTION } from "@/content/calculators/us-mortgage-deduction";
import { US_PAYROLL_TAX } from "@/content/calculators/us-payroll-tax";
import { US_RMD } from "@/content/calculators/us-rmd";
import { US_SOCIAL_SECURITY_ANALYSIS } from "@/content/calculators/us-social-security-analysis";
import { US_SOCIAL_SECURITY_ESTIMATE } from "@/content/calculators/us-social-security-estimate";
import { US_SOCIAL_SECURITY_PAYOUT } from "@/content/calculators/us-social-security-payout";
import { US_TBILL } from "@/content/calculators/us-tbill";

const ROUTES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../app/cong-cu",
);

/**
 * Which content key a route hands to a shell slot, read from the route source.
 *
 * A string that exists in a content module proves nothing about what the page
 * renders, and re-pointing `notice` at a shorter field is exactly the silent
 * demotion these assertions are here to catch.
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
 * Sentence count. A period must be followed by whitespace or end-of-string,
 * which is what makes it safe on Vietnamese grouped numbers: "1.091.589" is
 * one token, not three sentences.
 */
const sentences = (text: string) =>
  text.split(/[.!?](?:\s|$)/).filter(Boolean).length;

/**
 * Every US route this milestone touched, with what its first screen owes.
 *
 * `visible` — the US-applicability, year/eligibility and model limits that
 * must stay in `lede` or `notice`, where no click is required. `moved` — the
 * teaching and worked figures this pass relocated, which must still be on the
 * page inside a disclosure the route actually passes. The two columns together
 * are what makes a shortened entry provable rather than assumed: text in
 * `visible` may not sink, text in `moved` may not vanish.
 */
const SHELF = [
  {
    slug: "tiet-kiem-thue-vay-mua-nha",
    content: US_MORTGAGE_DEDUCTION,
    visible: [
      "luật thuế thu nhập liên bang Hoa Kỳ",
      "không áp dụng cho khoản vay mua nhà tại Việt Nam",
      "phóng đại",
    ],
    moved: ["32.000", "480 USD", "5,88%"],
  },
  {
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    content: US_HSA,
    visible: [
      "luật thuế Hoa Kỳ",
      "Section 125",
      "không phải một tỷ lệ cố định",
    ],
    moved: ["516,375", "100.000 USD"],
  },
  {
    slug: "thue-co-tuc",
    content: US_DIVIDEND_TAX,
    visible: ["0% hoặc 37%", "23,80%", "40,80%"],
    moved: ["1.980", "900 USD"],
  },
  {
    slug: "gop-401k",
    content: US_401K,
    visible: [
      "những năm đã qua",
      "thấp hơn số nhận được",
      "không phải một dự báo",
    ],
    moved: [
      "272.897",
      "263%",
      "1.091.589",
      // Relocated by this pass, out of a three-sentence lede.
      "mức sinh lời 50% hay 100% được bảo đảm",
    ],
  },
  {
    slug: "toi-da-401k",
    content: US_401K_MAX,
    visible: [
      "theo từng kỳ lương",
      "bù cuối năm",
      "không biết quỹ của bạn thuộc loại nào",
    ],
    moved: ["942,31", "4.800 USD", "một dòng trong tài liệu quỹ"],
  },
  {
    slug: "ira-truyen-thong-hay-roth",
    content: US_IRA,
    visible: [
      "chưa đủ để phương án truyền thống thắng",
      "thuế lãi vốn",
      "không phải một dự báo",
    ],
    moved: ["21,47%", "2,53 điểm phần trăm", "trước khi kết luận"],
  },
  {
    slug: "rut-toi-thieu-bat-buoc",
    content: US_RMD,
    visible: [
      "Hoa Kỳ",
      "không làm cạn tài khoản",
      "Bảng Tuổi thọ Thống nhất",
      "dự phóng",
    ],
    moved: ["30.188,68", "1.010.339", "288.154"],
  },
  {
    slug: "uoc-tinh-an-sinh-xa-hoi",
    content: US_SOCIAL_SECURITY_ESTIMATE,
    visible: [
      "Hoa Kỳ",
      "lũy thoái",
      "không phải bản ước tính chính thức của SSA",
    ],
    moved: [
      "2.825,80",
      "43,47%",
      "người thu nhập càng cao càng phải tự lo phần lớn hơn",
    ],
  },
  {
    slug: "phan-tich-an-sinh-xa-hoi",
    content: US_SOCIAL_SECURITY_ANALYSIS,
    visible: [
      "theo luật Hoa Kỳ",
      "hai câu trả lời",
      "dự phóng",
      "không tính thuế trên trợ cấp",
    ],
    moved: ["624.960", "403.341", "80 tuổi 4 tháng"],
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    content: US_SOCIAL_SECURITY_PAYOUT,
    visible: [
      "BHXH Việt Nam",
      "trợ cấp cho người còn sống",
      "không kiểm tra điều kiện hưởng",
    ],
    moved: ["4.200", "1.116", "đúng 0 đồng"],
  },
  {
    slug: "lam-phat-hoa-ky",
    content: US_INFLATION,
    visible: [
      "không nói gì về mức tăng giá của một căn nhà",
      "sức mua chỉ mất 50%",
    ],
    moved: ["66,67%"],
  },
  {
    slug: "tin-phieu-kho-bac-hoa-ky",
    content: US_TBILL,
    visible: [
      "thấp hơn lợi suất thực nhận",
      "360 ngày",
      "so hai đại lượng khác nhau",
    ],
    moved: ["5,1343%", "9.873,61", "5,0640%"],
  },
  {
    slug: "thue-luong-hoa-ky",
    content: US_PAYROLL_TAX,
    visible: [
      "CHỈ là FICA",
      "GIẢM chứ không tăng",
      "đối chiếu tài liệu IRS",
      "chọn đúng năm thuế",
    ],
    moved: ["184.500", "1,45%", "chưa từng được điều chỉnh theo lạm phát"],
  },
] as const;

/**
 * Live US routes this milestone did NOT touch, and why.
 *
 * Both are retirement-group tools whose entry copy belongs to a later
 * milestone. Listing them is what lets the coverage assertion below be a
 * derived set difference rather than a hand-counted total: add a `usRules`
 * route to the registry without an entry contract and the assertion fails,
 * naming the slug.
 */
const OUT_OF_SCOPE = ["phan-tich-thu-nhap-huu-tri", "nien-kim"] as const;

/**
 * The regression ceiling on visible entry text, in characters.
 *
 * DERIVED, not chosen: today's worst case rounded up — `chi-tra-an-sinh-xa-hoi`
 * at 746, whose lede is a single irreducible sentence naming both asymmetric
 * rules and whose notice is the same rule plus the eligibility limit. The point
 * of the number is that no route may grow past the one route that cannot
 * shrink. B2's twin bound is 700 for the same reason, from its own worst case.
 */
const ENTRY_BUDGET = 750;

describe("the US shelf's entry contract", () => {
  it("covers every live US route except the ones it names", () => {
    // Never quote a count from prose (AGENTS.md): the expected set is the
    // registry's own `usRules` flag, which is also what renders the automatic
    // US disclaimer above these notices.
    const registry = liveCalculators()
      .filter((entry) => entry.usRules)
      .map((entry) => entry.slug);
    expect(new Set(SHELF.map((r) => r.slug)).size).toBe(SHELF.length);
    expect(
      registry.filter(
        (slug) =>
          !SHELF.some((r) => r.slug === slug) &&
          !OUT_OF_SCOPE.includes(slug as (typeof OUT_OF_SCOPE)[number]),
      ),
      "a live US route has no entry contract and is not declared out of scope",
    ).toEqual([]);
    for (const row of SHELF)
      expect(
        registry,
        `${row.slug} is in this table but carries no usRules flag, so the US disclaimer above its notice is not rendering`,
      ).toContain(row.slug);
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

      it("keeps its US scope and model limits where no click is needed", () => {
        const visible = `${lede} ${notice}`;
        for (const limit of row.visible)
          expect(
            visible.includes(limit),
            `${row.slug}: "${limit}" left the visible entry slots`,
          ).toBe(true);
      });

      it("still carries what it moved, in a disclosure that renders", () => {
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
