/**
 * Markup test for the loan calculator's live regions.
 *
 * §4 of docs/calculator-suite-status.md allows exactly ONE live results region
 * per page, and the loan page has two `ResultGroup`s: the summary and the
 * extra-payment view. The second one mounts only when the extra payment is
 * above 0, and `form.defaultExtra` is "0" — so the prerendered HTML never
 * contains it and the built-HTML `aria-live` grep passes with the breach
 * present. That is why this has to be a render test and not a grep on `out/`.
 *
 * Server-rendered with `react-dom/server` in the runner's existing `node`
 * environment: no jsdom, no @testing-library, no new dependency (vitest.config.ts
 * pins the dependency surface at one package). `.test.ts`, not `.test.tsx`,
 * because that is what the vitest glob picks up — hence `createElement` instead
 * of JSX.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const CONTENT = "@/content/calculators/loan";

/** Every `aria-live="polite"` in the markup, results-level and field-level. */
function countPolite(html: string): number {
  return (html.match(/aria-live="polite"/g) ?? []).length;
}

/**
 * The result groups, in document order.
 *
 * `ResultGroup` is the only primitive that renders an `h2` — `FieldGroup` uses a
 * real `legend` and `ResultTable` a `caption` — and it puts its live wrapper
 * immediately after that heading. Matching on that shape rather than on the
 * wrapper's Tailwind classes keeps the test off result-group.tsx's styling.
 */
function resultGroups(html: string): { title: string; live: boolean }[] {
  return [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>\s*<div\b([^>]*)>/g)].map(
    (match) => ({
      title: match[1],
      live: match[2].includes('aria-live="polite"'),
    }),
  );
}

/**
 * Render the calculator, optionally overriding only `form.defaultExtra` so the
 * extra-payment group mounts. Leaves the module registry clean either way.
 */
async function render(defaultExtra?: string): Promise<string> {
  vi.resetModules();
  if (defaultExtra !== undefined) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/loan")>(
        CONTENT,
      );
      return {
        LOAN: {
          ...actual.LOAN,
          form: { ...actual.LOAN.form, defaultExtra },
        },
      };
    });
  }
  try {
    const { LoanCalculator } = await import("@/components/loan-calculator");
    return renderToStaticMarkup(createElement(LoanCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("LoanCalculator — one live results region", () => {
  it("has a single live result group at the defaults", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render();
    const groups = resultGroups(html);

    // Only the summary group renders: defaultExtra is "0", so interestSaving is null.
    expect(groups).toEqual([{ title: LOAN.form.resultTitle, live: true }]);
  });

  it("leaves the extra-payment group out of the live region", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const baseline = await render();
    const html = await render("5.000.000");
    const groups = resultGroups(html);

    // The second group really is on the page in this state...
    expect(groups.map((group) => group.title)).toEqual([
      LOAN.form.resultTitle,
      LOAN.form.extraResultTitle,
    ]);
    // ...and it is the summary, alone, that announces.
    expect(groups.filter((group) => group.live).map((group) => group.title)).toEqual([
      LOAN.form.resultTitle,
    ]);
    // No extra polite region appeared anywhere on the page: the field-level help
    // paragraphs are unchanged and the new group added none. (Before the fix this
    // count went up by one, from 10 to 11.)
    expect(countPolite(html)).toBe(countPolite(baseline));
  });
});
