import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { BOND } from "@/content/calculators/bond";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";
import { FIBONACCI } from "@/content/calculators/fibonacci";
import { PIVOT } from "@/content/calculators/pivot";

/**
 * WHICH SENTENCE EACH INVESTING ROUTE PUTS ABOVE THE CALCULATOR.
 *
 * The P4 audit's single most repeated finding on this shelf was not missing
 * copy: it was copy in the wrong slot. On rows 23, 40 and 42 the sentence
 * the requirement asks for was already written — and sat in the collapsed
 * FAQ (`components/calc/calculator-page.tsx` renders `faq` through
 * `Accordion`) while the visible red notice above the calculator was spent
 * on something else. So the contract worth testing is not "the string
 * exists" but "the route renders it in the slot a reader cannot miss".
 *
 * `noticeDetail` is where the displaced paragraph goes, not the bin: the
 * shell's own docstring keeps `notice` to one or two sentences because a
 * browser check found long notices pushing the form off the first screens
 * on a phone. Every promotion here therefore asserts BOTH halves — the
 * claim arrived in `notice`, and what it replaced is still on the page.
 */

const ROUTES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../app/cong-cu",
);

/**
 * The content key a route actually passes to a shell slot.
 *
 * Read from the route source rather than assumed, so re-pointing `notice`
 * at a different field is a failing test rather than a silent demotion —
 * which is precisely the state these three rows shipped in.
 */
function slotKey(slug: string, slot: string): string {
  const source = readFileSync(`${ROUTES}/${slug}/page.tsx`, "utf8");
  const match = new RegExp(`\\b${slot}=\\{C\\.([A-Za-z0-9_.]+)\\}`).exec(source);
  if (!match) throw new Error(`${slug}: no ${slot}={C.…} in the route`);
  return match[1];
}

function slotText(content: unknown, slug: string, slot: string): string {
  const value = slotKey(slug, slot)
    .split(".")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown>)[key],
      content,
    );
  if (typeof value !== "string")
    throw new Error(`${slug}: ${slot} does not resolve to a string`);
  return value;
}

const faqText = (content: { faq: { items: readonly { a: string }[] } }) =>
  content.faq.items.map((item) => item.a).join(" ");

/**
 * Each row's promotion, as the claim's load-bearing words.
 *
 * Alternatives rather than one sentence, because the assertion is about the
 * CLAIM surviving a reword, not about a string. Every token below is
 * checked lower-cased: row 42's FAQ answer opens "Không có bằng chứng…",
 * and a case-sensitive check reported that claim missing from an answer
 * that makes it in its first four words.
 */
const PROMOTIONS = [
  {
    slug: "trai-phieu",
    content: BOND,
    what: "every yield on the page assumes the issuer pays",
    // "does not model default risk" AND "a yield is only real if you are paid".
    claim: ["không tính rủi ro vỡ nợ", "nếu bạn thực sự nhận được tiền"],
    // The FAQ's own wording for the same argument — see the note below.
    faqClaim: "không tính rủi ro vỡ nợ",
    // The three-yield distinction it displaced.
    displaced: ["lợi suất hiện tại", "lợi suất đáo hạn"],
  },
  {
    slug: "quyen-chon-black-scholes",
    content: BLACK_SCHOLES,
    what: "the model price is not the traded price",
    claim: ["không phải giá đang giao dịch", "trung tính rủi ro"],
    faqClaim: "trung tính rủi ro",
    // The Vietnamese-market context it displaced.
    displaced: ["chứng quyền có bảo đảm", "hose"],
  },
  {
    slug: "fibonacci",
    content: FIBONACCI,
    what: "a technical level guarantees no reversal",
    claim: ["không bảo đảm", "hành vi của người tham gia thị trường"],
    faqClaim: "hành vi người tham gia thị trường",
    // The worked direction example it displaced — both prices.
    displaced: ["47.640", "52.360"],
  },
] as const;

describe("the decisive caveat is in the visible slot, not the accordion", () => {
  it("states each row's claim in the notice the route renders", () => {
    for (const p of PROMOTIONS) {
      const notice = slotText(p.content, p.slug, "notice").toLowerCase();
      for (const token of p.claim)
        expect(
          notice.includes(token.toLowerCase()),
          `${p.slug}: the notice does not say ${p.what} — missing "${token}"`,
        ).toBe(true);
    }
  });

  it("discriminates — each row's PRE-promotion notice fails the same check", () => {
    // VACUITY GUARD. A token list this loose could match anything, so it is
    // run against the notices these three routes actually shipped before
    // this unit. All three must fail, or the check above proves nothing.
    const before: Record<string, string> = {
      "trai-phieu":
        "Ba con số dưới đây đều được gọi là “lợi suất” và chúng khác nhau. " +
        "Lãi suất coupon 8%/năm là con số cố định tính trên mệnh giá.",
      "quyen-chon-black-scholes":
        "Việt Nam chưa có thị trường quyền chọn cổ phiếu niêm yết. Công cụ " +
        "này hữu ích nhất cho hai việc: định giá chứng quyền có bảo đảm " +
        "đang giao dịch trên HOSE.",
      fibonacci:
        "Chiều là ô quan trọng nhất và cũng là ô dễ nhập sai nhất. Với đợt " +
        "biến động từ 40.000 lên 60.000, mức điều chỉnh 61,8% ở xu hướng " +
        "tăng là 47.640 ₫.",
    };
    for (const p of PROMOTIONS) {
      const old = before[p.slug].toLowerCase();
      const satisfied = p.claim.every((t) => old.includes(t.toLowerCase()));
      expect(
        satisfied,
        `${p.slug}: the pre-promotion notice already satisfied this check, ` +
          `so the check is not what moved`,
      ).toBe(false);
    }
  });

  it("keeps what it displaced one disclosure away, not deleted", () => {
    for (const p of PROMOTIONS) {
      const detail = slotText(p.content, p.slug, "noticeDetail").toLowerCase();
      for (const token of p.displaced)
        expect(
          detail.includes(token.toLowerCase()),
          `${p.slug}: "${token}" left the page instead of moving to noticeDetail`,
        ).toBe(true);
      // A detail with no summary line renders NOTHING in the shell — both
      // props are required together (`calculator-page.tsx`).
      expect(slotKey(p.slug, "noticeDetailTitle")).toBeTruthy();
    }
  });

  it("keeps each claim in the FAQ too — promotion, not relocation", () => {
    // The requirement was that the sentence be VISIBLE, not that the longer
    // treatment be cut. Promoting a claim by deleting where it was is how a
    // page keeps the assertion and loses the argument.
    //
    // `faqClaim` is a SEPARATE token from the notice's, and deliberately:
    // the two surfaces make the same argument in their own words — row 42's
    // notice says "hành vi của người tham gia thị trường" and its FAQ says
    // "hành vi người tham gia thị trường" — so asserting the notice's
    // wording against the FAQ pins a string rather than a claim. That is
    // exactly how this assertion failed on its first run.
    for (const p of PROMOTIONS) {
      const answers = faqText(p.content).toLowerCase();
      expect(
        answers.includes(p.faqClaim.toLowerCase()),
        `${p.slug}: the FAQ no longer argues ${p.what}`,
      ).toBe(true);
    }
  });
});

/**
 * THE 41 <-> 42 ASYMMETRY, which is what made row 42's promotion a finding
 * rather than a preference.
 *
 * These are the suite's two technical-analysis pages and both owe the same
 * statement. Row 41 had it in the red notice; row 42 had the better version
 * of it in the accordion. Asserted as a PAIR, because the point is that the
 * two pages agree.
 */
describe("both technical-analysis rows deny a signal in the same slot", () => {
  const DENIES = ["không dự đoán", "không bảo đảm", "không có bằng chứng"];
  const deniesASignal = (text: string) => {
    const t = text.toLowerCase();
    return (
      DENIES.some((token) => t.includes(token)) &&
      t.includes("hành vi") &&
      t.includes("không phải")
    );
  };

  it("holds for row 41 and row 42 alike", () => {
    for (const [slug, content] of [
      ["diem-pivot", PIVOT],
      ["fibonacci", FIBONACCI],
    ] as const) {
      expect(
        deniesASignal(slotText(content, slug, "notice")),
        `${slug}: its notice does not deny a signal`,
      ).toBe(true);
    }
  });

  it("records that row 41 states it ONCE, correcting the P4 plan", () => {
    // The plan records row 41 as shipping this "three times: the red
    // notice, the table intro and the FAQ". Measured on source, the
    // complete claim — deny the prediction AND replace it with participant
    // behaviour rather than asset value — occurs exactly once in
    // `pivot.ts`, in the notice. The table intro says the four methods
    // disagreeing is "not any method's fault" and the first FAQ answer says
    // there is no correct method; both are adjacent points and neither is
    // this claim.
    //
    // Row 41 is therefore compliant but not redundant. Asserting a second
    // copy it does not have would have been a red test for a true page —
    // which is how this got checked rather than assumed.
    expect(deniesASignal(faqText(PIVOT))).toBe(false);
    expect(deniesASignal(PIVOT.form.table.intro)).toBe(false);
    expect(deniesASignal(faqText(FIBONACCI))).toBe(true);
  });

  it("keeps row 42's promoted notice no longer than row 41's", () => {
    // WHY A BOUND AT ALL: `calculator-page.tsx` keeps this slot to one or
    // two sentences because long notices push the form off a phone's first
    // screens — at 390 px the block is ~330 px wide and a 14 px line
    // carries ~45 characters, so every ~330 characters is another seven
    // lines above the first field.
    //
    // The bound is DERIVED rather than invented: row 41 already ships this
    // claim in this slot, so its length is the working precedent. A pixel
    // number chosen here would be a guess — nothing in this file has been
    // seen in a browser.
    const promoted = slotText(FIBONACCI, "fibonacci", "notice");
    const precedent = slotText(PIVOT, "diem-pivot", "notice");
    expect(
      promoted.length,
      `row 42's notice is ${promoted.length} chars against row 41's ` +
        `${precedent.length} — move the example back to noticeDetail`,
    ).toBeLessThanOrEqual(precedent.length);
  });
});
