/**
 * Rendered-markup contracts for /cong-cu/doi-don-vi/.
 *
 * ORIGINAL ROW 71. The defect this file exists to keep closed: the form opened
 * on "Sào Bắc Bộ", so a Central-region plot was converted at 360 m² instead of
 * 499,95 m² — 39% out, with no invalid state and nothing on screen saying a
 * choice had been made on the reader's behalf.
 *
 * Server-rendered with `renderToStaticMarkup`. Nothing here is a visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UNITS_CONTENT } from "@/content/calculators/units";

const CONTENT = "@/content/calculators/units";

type FormPatch = Partial<
  Record<keyof typeof UNITS_CONTENT.form, string | object>
>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/units")
      >(CONTENT);
      return {
        UNITS_CONTENT: {
          ...actual.UNITS_CONTENT,
          form: { ...actual.UNITS_CONTENT.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/units-calculator");
    return renderToStaticMarkup(createElement(loaded.UnitsCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = UNITS_CONTENT.form;

describe("the region is confirmed, never defaulted", () => {
  it("opens on sào with NO region chosen and no figure", async () => {
    const html = await render();
    expect(html).toContain(C.regionLegend);
    expect(html).toContain(C.regionRequiredNotice);
    // The old default answered 1 sào as 360 m² with no warning. The result
    // rows are now the placeholder, and there is no equation to copy.
    const live = html.slice(html.indexOf('data-results-live="true"'));
    const results = live.slice(0, live.indexOf("</div></div>"));
    expect(results).not.toContain(">360<");
    expect(results).toContain("—");
    expect(html).not.toContain(C.equationLabel);
  });

  it("offers sào and mẫu as ONE option each, not four regional ones", async () => {
    const html = await render();
    expect(html).toContain(UNITS_CONTENT.units.area.sao);
    expect(html).toContain(UNITS_CONTENT.units.area.mau);
    // The regional variants are not selectable in the form; they are what a
    // confirmed region resolves to, and they still label the tables.
    const selects = html.slice(0, html.indexOf(C.resultTitle));
    expect(selects).not.toContain('value="saoBac"');
    expect(selects).not.toContain('value="mauTrung"');
  });

  it("answers once a region is confirmed, with that region named", async () => {
    const north = await render({ defaultRegion: "bac", defaultValue: "2" });
    expect(north).not.toContain(C.regionRequiredNotice);
    expect(north).toContain("720");
    expect(north).toContain(UNITS_CONTENT.units.area.saoBac);

    const centre = await render({ defaultRegion: "trung", defaultValue: "2" });
    expect(centre).toContain("999,9");
    expect(centre).toContain(UNITS_CONTENT.units.area.saoTrung);
  });

  it("shows the short regional comparison on the reader's own figure", async () => {
    // Visible even before a region is confirmed: seeing the two figures is
    // what makes the question worth answering.
    const html = await render({ defaultValue: "2" });
    expect(html).toContain(C.comparison.title);
    expect(html).toContain("720");
    expect(html).toContain("999,9");
    expect(html).toContain(C.comparison.note);
  });

  it("names the OUTPUT unit on the comparison's value column", async () => {
    // The defect: 2 sào → ha showed 0,072 beside 0,09999 under a bare "Kết
    // quả", while the row labels named 360 m² and 499,95 m² — two units on
    // one line, neither of them the answer's.
    const html = await render({ defaultValue: "2", defaultToId: "ha" });
    expect(html).toContain(">0,072<");
    expect(html).toContain(">0,09999<");
    const heading = C.comparison.valueColumnIn.replace(
      "{unit}",
      UNITS_CONTENT.units.area.ha,
    );
    expect(html).toContain(heading);
    // The comparison's own value heading is never the bare fallback.
    const table = html.slice(html.indexOf(C.comparison.title));
    expect(table).not.toContain(`>${C.comparison.valueColumn}<`);
  });

  it("compares when the convention decides the TARGET side", async () => {
    // m² → mẫu is the direction a reader with a deed takes. It used to render
    // only the long all-unit table, with nothing saying the answer depends on
    // a convention at all.
    const html = await render({
      defaultValue: "3.600",
      defaultFromId: "m2",
      defaultToId: "mau",
    });
    expect(html).toContain(C.comparison.title);
    expect(html).toContain(C.comparison.perRowNote);
    expect(html).toContain(C.comparison.valueColumnPerRow);
    // 3.600 m² is exactly 1 mẫu under one convention and 0,720072 under the
    // other.
    expect(html).toContain(">1<");
    expect(html).toContain(">0,720072<");
  });

  it("names the fixed target convention when both sides are regional", async () => {
    const html = await render({
      defaultValue: "10",
      defaultFromId: "sao",
      defaultToId: "mau",
      defaultRegion: "bac",
    });
    expect(html).toContain(
      C.comparison.targetConventionNote.replace(
        "{unit}",
        UNITS_CONTENT.units.area.mauBac,
      ),
    );
  });
});

describe("readable precision", () => {
  it("does not pad a whole number with six zeros", async () => {
    const html = await render({ defaultRegion: "bac", defaultValue: "2" });
    expect(html).not.toContain("720,000000");
    expect(html).toContain(">720<");
  });

  it("keeps significant digits on a small figure", async () => {
    // One sào Bắc Bộ across the whole category: 0,036 ha and 0,0720072 mẫu
    // Trung Bộ — six significant digits, no padding, thousands grouped where
    // there are any.
    const html = await render({ defaultRegion: "bac", defaultValue: "1" });
    expect(html).toContain(">0,036<");
    expect(html).toContain(">0,0720072<");
    expect(html).toContain(">3.875,01<");
  });

  it("states that the display is rounded and the model is not", async () => {
    const html = await render({ defaultRegion: "bac" });
    expect(html).toContain(C.precisionNote);
    expect(html).toContain(C.factorLabel);
  });
});

describe("the copyable result", () => {
  it("renders the equation as visible text and a copy button", async () => {
    const html = await render({ defaultRegion: "bac", defaultValue: "2" });
    expect(html).toContain(C.equationLabel);
    expect(html).toContain(C.copyLabel);
    // The region is INSIDE the copied line: a pasted "2 sào = 720 m²" with no
    // region would be the original defect, travelling.
    expect(html).toContain(
      `2 ${UNITS_CONTENT.units.area.saoBac} = 720 ${UNITS_CONTENT.units.area.m2}`,
    );
  });

  it("copies nothing until the button is clicked", async () => {
    // Server-rendered markup carries no copied/failed state, and the only
    // clipboard call in `CopyButton` is inside its own onClick.
    const html = await render({ defaultRegion: "bac", defaultValue: "2" });
    expect(html).not.toContain(C.copiedLabel);
    expect(html).not.toContain(C.copyFailedLabel);
  });

  it("binds the copied confirmation to the text it was about", async () => {
    // The defect: copy 3.600 m² = 1 mẫu, then edit the input to 7.200 — the
    // equation changed to 2 mẫu and the success line stayed, claiming a
    // clipboard that held the old line. The state now carries the attempted
    // string and is shown only while it is still what the button would copy,
    // which also stales a late `writeText` resolution.
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("components/calc/copy-button.tsx", "utf8"),
    );
    expect(source).toContain("result.text === text");
    expect(source).toContain("const attempted = text");
    // And no effect ever writes: the only call sits inside the handler.
    expect(source).not.toContain("useEffect");
    expect((source.match(/clipboard\.writeText\(/g) ?? []).length).toBe(1);
  });

  it("offers no equation while there is no result", async () => {
    const html = await render({ defaultValue: "abc" });
    expect(html).toContain(C.valueInvalid);
    expect(html).not.toContain(C.copyLabel);
  });
});

describe("copy that belongs to THIS route", () => {
  it("qualifies the land conventions instead of asserting them", async () => {
    // A region does not determine the figure: local usage varies, and a
    // commune notice (Quảng Trị, 03/03/2026) states 1 sào = 500 m². The
    // factor stays; the claim around it is now a named convention.
    const all = JSON.stringify(UNITS_CONTENT);
    expect(all).toContain("quy ước");
    expect(all).toContain("500 m²");
    expect(all).not.toContain("các tỉnh Trung Bộ dùng 499,95");
    expect(all).not.toContain("công cụ vẫn giữ con số chính xác");
    expect(UNITS_CONTENT.regionNotice).toContain("giấy chứng nhận");
  });

  it("claims nothing about gold purity or price", async () => {
    const faq = UNITS_CONTENT.faq.items.map((item) => item.a).join(" ");
    expect(faq).not.toContain("khác hàm lượng vàng và khác giá");
    expect(faq).toContain("không cho biết hàm lượng vàng hay giá");
  });

  it("uses a unit/rounding disclaimer, not the interest-rate one", async () => {
    expect(UNITS_CONTENT.disclaimer).toContain("làm tròn");
    expect(UNITS_CONTENT.disclaimer).toContain("QUY ƯỚC");
    expect(UNITS_CONTENT.disclaimer).toContain("diện tích pháp lý");
    expect(UNITS_CONTENT.disclaimer).not.toContain("lãi suất");
    expect(UNITS_CONTENT.disclaimer).not.toContain("lợi nhuận");
    expect(UNITS_CONTENT.disclaimer).not.toContain("lời khuyên đầu tư");
    // It keeps the clause `check:markup` counts to prove a calculator still
    // carries a disclaimer at all — the first gate run of this repair pass
    // failed on exactly that, with "one disclaimer: found 0".
    expect(UNITS_CONTENT.disclaimer.startsWith(
      "Công cụ này chỉ mang tính minh họa",
    )).toBe(true);
  });

  it("does not call re-entry the only way to keep a result", async () => {
    // This page has a working copy button, so the shared sentence is false
    // here — and correcting the shared one would make it false for the other
    // 74 tools.
    const { nextStepsFor } = await import("@/content/calculators/next-steps");
    const { TOOL_SHELL } = await import("@/content/calculators/tool-shell");
    const own = nextStepsFor("doi-don-vi")?.saveBody;
    expect(own).toBeDefined();
    expect(own).not.toContain("cách duy nhất");
    expect(own).toContain("sao chép");
    // The shared promises are kept.
    expect(own).toContain("không lưu");
    expect(own).toContain("không gửi");
    // And the shared text is untouched for everyone else.
    expect(TOOL_SHELL.nextSteps.saveBody).toContain("cách duy nhất");
    expect(nextStepsFor("lai-kep")?.saveBody).toBeUndefined();
  });
});

describe("the other categories are unchanged", () => {
  it("shows no region control where it would decide nothing", async () => {
    const html = await render({ defaultValue: "1,5" });
    // Area is the default category, so the control IS here; the guard is that
    // it is conditional on an ambiguous unit being selected.
    expect(html).toContain(C.regionLegend);
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("components/units-calculator.tsx", "utf8"),
    );
    expect(source).toContain("{ambiguous ? (");
  });

  it("keeps one live results region", async () => {
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});
