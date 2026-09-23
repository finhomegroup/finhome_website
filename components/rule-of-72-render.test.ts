/**
 * Rendered-markup contracts for `/cong-cu/quy-tac-72/` (audit CSV row 20).
 *
 * The action is "Giữ giao diện một khối ngắn; không thêm chart chỉ để đồng bộ,
 * kết quả ngay dưới lãi suất." Two of those three were already true before the
 * pass, so this file pins all three together — including the NEGATIVE one, a
 * chart added for consistency being exactly what the row forbids.
 *
 * This route is the one entry in the two-live-region allowlist: it asks two
 * questions, each with its own input, and `ResultCta` scopes its first-invalid
 * search to its own `formId`. Appearance is not checked here and nothing in
 * this file is a visual observation.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RuleOf72Calculator } from "@/components/rule-of-72-calculator";
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";

const html = renderToStaticMarkup(createElement(RuleOf72Calculator));

describe("§8 row 20: two short blocks, no chart", () => {
  it("stays one column in both blocks", () => {
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("adds no chart", () => {
    // "Không thêm chart chỉ để đồng bộ" — the table already answers this tool,
    // and docs §3 forbids chart chrome added for consistency alone.
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<figure");
  });

  it("puts each answer directly under its own input", () => {
    const rateForm = html.indexOf('id="quy-tac-72-lai-suat-nhap"');
    const rateAnswer = html.indexOf('id="quy-tac-72-thoi-gian"');
    const yearsForm = html.indexOf('id="quy-tac-72-thoi-gian-nhap"');
    const yearsAnswer = html.indexOf('id="quy-tac-72-lai-suat"');
    expect(rateForm).toBeGreaterThan(-1);
    expect(rateAnswer).toBeGreaterThan(rateForm);
    expect(yearsForm).toBeGreaterThan(rateAnswer);
    expect(yearsAnswer).toBeGreaterThan(yearsForm);
  });

  it("gives each question its own CTA, scoped to its own field", () => {
    expect(html.split('data-calc-cta="true"').length - 1).toBe(2);
    expect(html).toContain('aria-controls="quy-tac-72-thoi-gian"');
    expect(html).toContain('aria-controls="quy-tac-72-lai-suat"');
  });

  it("emphasises the estimate in each block, and only the estimate", () => {
    // One per block: the estimate is what the rule of 72 is for, and the exact
    // figure beside it is the check on it.
    expect(html.split("md:text-3xl").length - 1).toBe(2);
    expect(html).toContain(C.form.estimateLabel);
    expect(html).toContain(C.form.exactLabel);
  });

  it("keeps both tables in a detail region below the answers", () => {
    expect(html.split("<table").length - 1).toBe(2);
    const firstTable = html.indexOf("<table");
    expect(html.indexOf('data-calc-region="detail"')).toBeLessThan(firstTable);
  });
});
