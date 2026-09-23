/**
 * Rendered-markup contracts for `/cong-cu/tinh-phan-tram/` (audit CSV row 61).
 *
 * WHY THIS ROUTE IS A PILOT. It is the audit's "Gọn" classification — the
 * shortest complete tool on the shell — and its CSV action is "chọn phép tính
 * trước, kết quả ngay dưới hai ô; không cần chart hoặc bảng phụ". Two of those
 * three clauses were ALREADY TRUE before this pass, and the approved contract
 * says to preserve and close a per-tool recommendation rather than rebuild it.
 * So the assertions below are split deliberately: some pin what was already
 * right so a later sweep cannot regress it, and some pin what changed.
 *
 * What changed: the CTA, the single emphasised answer, and the split of the
 * four-sentence asymmetry notice into a visible distinction plus a labelled
 * disclosure. The audit measured this route's first numeric input 1.041 px
 * down a 390×844 viewport.
 *
 * What did NOT change, and is asserted so it stays that way: no chart, no
 * secondary table, and the mode radio ahead of the two boxes.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no jsdom, so the CTA's click behaviour is not exercised here.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PERCENT } from "@/content/calculators/percent";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";

const CONTENT_PATH = "@/content/calculators/percent";

const RESULT_ID = "tinh-phan-tram-ket-qua";
const FORM_ID = "tinh-phan-tram-nhap";

/**
 * Render the calculator, optionally on a patched default for the "of" mode's
 * first box — the only lever this test needs, because the form opens on that
 * mode and an empty box is the audit's own emptiness case.
 */
async function render(defaultA?: string): Promise<string> {
  vi.resetModules();
  if (defaultA !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        PERCENT: typeof PERCENT;
      };
      return {
        PERCENT: {
          ...actual.PERCENT,
          form: {
            ...actual.PERCENT.form,
            modes: {
              ...actual.PERCENT.form.modes,
              of: { ...actual.PERCENT.form.modes.of, defaultA },
            },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/percent-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.PercentCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

describe("tinh-phan-tram stays a compact utility", () => {
  it("renders inputs then the result, and nothing else", async () => {
    // "Kết quả ngay dưới hai ô". There is no detail region because there is no
    // detail: a percentage has no schedule and no ledger.
    expect(regionOrder(await render())).toEqual(["form", "result"]);
  });

  it("does not ask for the 40/60 split", async () => {
    // The compact half of the layout rule. Four short controls in two columns
    // is two stub columns with a hole between them.
    expect(await render()).not.toContain("lg:col-span-2");
  });

  it("adds no chart and no secondary table", async () => {
    // CSV row 61 says so outright, and docs §3 forbids chart chrome added for
    // consistency. This is the assertion that stops a later sweep "finishing"
    // this route by giving it a figure.
    const html = await render();
    expect(count(html, "<svg")).toBe(0);
    expect(count(html, "<table")).toBe(0);
    expect(count(html, "<figure")).toBe(0);
  });

  it("puts the mode choice ahead of the two boxes", async () => {
    // Already true before this pass; pinned so it stays true. The two boxes
    // mean different things per mode, so choosing the question first is what
    // makes their labels honest.
    const html = await render();
    expect(html.indexOf(PERCENT.form.modeLegend)).toBeLessThan(
      html.indexOf(PERCENT.form.modes.of.aLabel),
    );
  });
});

describe("the CTA on a compact tool", () => {
  it("sits in the form region and names the result", async () => {
    const html = await render();
    const form = html.slice(
      html.indexOf(`id="${FORM_ID}"`),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
    expect(form).toContain(`aria-controls="${RESULT_ID}"`);
  });

  it("says the result is already current", async () => {
    const html = await render();
    expect(html).toContain(TOOL_SHELL.cta.label);
    expect(html).toContain(TOOL_SHELL.cta.autoNote);
  });

  it("switches to the recovery sentence on an empty box", async () => {
    const html = await render("");
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain(TOOL_SHELL.cta.autoNote);
  });
});

describe("one main answer, and it is gone when the input is not usable", () => {
  it("emphasises exactly one figure", async () => {
    // docs and the audit's P2: "một câu trả lời chính, 2–3 số hỗ trợ". The
    // emphasised size is `ResultRow`'s `emphasis` branch, and more than one
    // per group is the equal-weight problem again with bigger type.
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
  });

  it("withholds the answer instead of keeping the example's number", async () => {
    // 30% of 2.000.000.000 is 600.000.000 at the shipped defaults. With the
    // percentage box empty the tool must show no figure at all — a stale
    // authoritative result is the failure this asserts against.
    expect(await render()).toContain("600.000.000");
    const blank = await render("");
    expect(blank).not.toContain("600.000.000");
    expect(blank).toContain("—");
  });

  it("shortens the entry copy and does not repeat the units twice", async () => {
    // Measured first numeric input was 1.020,75 px down a 390×844 viewport —
    // the worst of the three pilots. The lede enumerated the four answers and
    // the mode help then repeated the three units directly above the first
    // input, with the notice above the tool saying the same thing again.
    expect(PERCENT.lede.length).toBeLessThan(80);
    expect(PERCENT.form.modeHelp.length).toBeLessThan(80);
    expect(PERCENT.ledeDetail.length).toBeGreaterThan(PERCENT.lede.length);
    // Nothing deleted: the enumeration is disclosed, and labelled.
    expect(PERCENT.ledeDetailTitle.length).toBeGreaterThan(10);
    expect(PERCENT.ledeDetail).toContain("điểm phần trăm");
  });

  it("does not pin a current-answer block on a compact tool", async () => {
    // The affordance exists for a form long enough to scroll the answer away.
    // Four controls is not that, and a pinned block would be chrome.
    const html = await render();
    expect(html).not.toContain('data-calc-answer="true"');
    expect(html).not.toContain("fh-cta-pin");
  });

  it("keeps exactly one live results region", async () => {
    expect(count(await render(), 'data-results-live="true"')).toBe(1);
    expect(count(await render(""), 'data-results-live="true"')).toBe(1);
  });
});
