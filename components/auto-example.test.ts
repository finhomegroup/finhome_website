/**
 * The guide ↔ car-tool journey (review 2026-09-30): the public named example,
 * the never-overwrite rule, the new-tab links and the page-scoped catalogue
 * label.
 *
 * WHAT IT CANNOT: run the effect in a browser. The fragment is read after
 * hydration, so the static render below is the default example; the load
 * itself is proven through the pure decision and the source wiring, and
 * still needs a browser pass (see docs/auto-loan-education-2026-09-30.md).
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import {
  exampleArrival,
  namedExampleHref,
  namedExampleId,
  namedExampleValues,
} from "@/components/auto-example";
import { AutoLoanCalculator, autoLoanFormState } from "@/components/auto-loan-calculator";
import { AutoLoanRelated } from "@/components/auto-loan-related";
import { makeAutoTrial } from "@/components/auto-learning";
import { initialTrialState, trialReducer } from "@/components/calc/learning-trials";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";
import { CALCULATOR_HUB } from "@/content/calculators/hub";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { getPost } from "@/content/posts";

const ID = "vi-du-bai-vay-mua-xe" as const;
const read = (path: string) => readFileSync(path, "utf8");
const defaults = () => ({
  price: C.form.defaultPrice,
  down: C.form.defaultDown,
  tradeIn: C.form.defaultTradeIn,
  rate: C.form.defaultRate,
  term: C.form.defaultTerm,
  termUnit: C.form.defaultTermUnit,
  netIncome: C.form.defaultNetIncome,
  essentials: C.form.defaultEssentials,
  otherDebts: C.form.defaultOtherDebts,
  reserve: C.form.defaultReserve,
  running: C.form.defaultRunning,
});

describe("the fragment is a public ID, never data", () => {
  it("recognises only an exact example ID, with or without #", () => {
    expect(namedExampleId(`#${ID}`)).toBe(ID);
    expect(namedExampleId(ID)).toBe(ID);
    for (const hash of ["", "#", "#vay-mua-xe-ket-qua", `#${ID}&price=1`, `#${ID.toUpperCase()}`, "#constructor", "#__proto__", "#toString"]) {
      expect(namedExampleId(hash), hash).toBeNull();
    }
    expect(namedExampleHref(ID)).toBe("/cong-cu/vay-mua-xe/#vi-du-bai-vay-mua-xe");
    expect(namedExampleHref(ID)).not.toMatch(/\d/);
  });

  it("opens the guide's exact fictional household and its published results", () => {
    const values = namedExampleValues(ID);
    expect(values).toEqual({
      price: "700.000.000", down: "300.000.000", tradeIn: "0", rate: "10", term: "5", termUnit: "years",
      netIncome: "40.000.000", essentials: "22.000.000", otherDebts: "3.000.000", reserve: "3.000.000", running: "3.000.000",
    });
    const state = autoLoanFormState(values);
    expect(state.termMonths).toBe(60);
    expect(Math.round(state.result!.loan.monthlyPrincipalInterest)).toBe(8498818);
    expect(Math.round(state.budget!.withCar!)).toBe(501182);
    // A copy each time: a caller cannot edit the example for the next reader.
    values.price = "1";
    expect(namedExampleValues(ID).price).toBe("700.000.000");
  });

  it("names the article it came from, by its real title", () => {
    const example = C.namedExamples[ID];
    const slug = example.articleHref.replace(/^\/blog\/|\/$/g, "");
    expect(getPost(slug)?.title).toBe(example.articleTitle);
    expect(C.explainer.href).toBe(example.articleHref);
    expect(read(`content/posts/${slug}.md`)).toContain(`(${namedExampleHref(ID)})`);
  });
});

describe("a link never overwrites what the reader typed", () => {
  const example = namedExampleValues(ID);
  const edited = { ...defaults(), price: "650.000.000" };

  it("loads into an untouched form, offers otherwise, and ignores the rest", () => {
    expect(exampleArrival(ID, { untouched: true, values: defaults() })).toBe("load");
    expect(exampleArrival(ID, { untouched: false, values: edited })).toBe("offer");
    expect(exampleArrival(null, { untouched: true, values: defaults() })).toBe("ignore");
    expect(exampleArrival(null, { untouched: false, values: edited })).toBe("ignore");
    // Already on screen — including after the reader typed it back — nothing to do.
    expect(exampleArrival(ID, { untouched: true, values: example })).toBe("ignore");
    expect(exampleArrival(ID, { untouched: false, values: example })).toBe("ignore");
  });

  it("wires the fragment through that decision, after hydration, with no storage or network", () => {
    const source = read("components/auto-loan-calculator.tsx");
    // A subscription whose server snapshot is null: the static HTML is the
    // default example, and the fragment is read only after hydration.
    expect(source).toMatch(/useSyncExternalStore\(\s*subscribeFragment,\s*readFragment,\s*serverFragment,?\s*\)/);
    expect(source).toContain("const serverFragment = () => null;");
    expect(source).toContain('addEventListener("hashchange", onChange)');
    expect(source).toContain('removeEventListener("hashchange", onChange)');
    expect(source).toContain("exampleArrival(fragmentId, {");
    expect(source).toContain("untouched: pristine && learning.trials.length === 0,");
    // Only `loadExample` writes the whole form, and only from "load" or the offer button.
    expect(source.match(/raw\.load\(namedExampleValues/g)?.length).toBe(1);
    // Two call sites: the "load" arrival and the offer's button.
    expect(source.match(/loadExample\(/g)?.length).toBe(2);
    expect(source).toContain('arrival === "load") loadExample(fragmentId);');
    expect(source).toContain("onClick={() => loadExample(offerId)}");
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|history\.(push|replace)State/);
  });
});

describe("the example's trial and undo buttons, as the guide teaches them", () => {
  it("Kéo dài kỳ hạn thêm 2 năm turns 5 years into 7, and Hoàn tác lần thử takes it back", () => {
    const values = namedExampleValues(ID);
    const state = autoLoanFormState(values);
    const trial = makeAutoTrial({ key: "term", values, revision: 0, state, label: "" })!;
    expect(trial.after.term).toBe("7");
    const seven = autoLoanFormState(trial.after as typeof values);
    expect(seven.termMonths).toBe(84);
    expect(Math.round(seven.result!.loan.monthlyPrincipalInterest)).toBe(6640474);
    expect(Math.round(seven.result!.loan.totalInterest)).toBe(157799783);
    const applied = trialReducer(initialTrialState<"term", typeof state>(), { type: "apply", trial });
    expect(applied.trials).toHaveLength(1);
    const undone = trialReducer(applied, { type: "undo" });
    expect(undone.trials).toHaveLength(0);
    expect(trial.before).toEqual(values);
  });
});

describe("the default route is unchanged", () => {
  it("prerenders the tool's own example, with no named-example line or offer", () => {
    const html = renderToStaticMarkup(createElement(AutoLoanCalculator));
    expect(html).toContain("3.501.182 ₫");
    expect(html).toContain(`value="${C.form.defaultPrice}"`);
    expect(html).not.toContain("data-auto-named-example");
    expect(html).not.toContain("data-auto-example-offer");
    expect(C.form.defaultPrice).toBe("800.000.000");
    expect(C.form.defaultTradeIn).toBe("100.000.000");
    expect(C.form.defaultRunning).toBe("0");
  });
});

describe("links a reader comes back from open a labelled new tab", () => {
  const related = C.relatedTools.items.map((item) => ({
    ...item,
    href: `/cong-cu/${item.slug}/`,
    title: item.slug,
  }));
  const html = renderToStaticMarkup(createElement(AutoLoanRelated, { related }));
  // Outside a Next build `next/link` drops the trailing slash; a plain `<a>`
  // keeps it. Either form is the same destination here.
  const at = (href: string) => {
    const bare = href.replace(/\/$/, "");
    const found = html.search(new RegExp(`href="${bare}/?"`));
    expect(found, href).toBeGreaterThan(-1);
    return found;
  };
  const tagFor = (href: string) => {
    const i = at(href);
    return html.slice(html.lastIndexOf("<a", i), html.indexOf("</a>", i));
  };

  it("sends tool → article through the shared EducationLink, in a new tab", () => {
    const tag = tagFor(C.explainer.href);
    expect(tag).toContain('target="_blank"');
    expect(tag).toContain('rel="noopener noreferrer"');
    expect(tag).toContain(C.explainer.label);
    expect(tag).toContain(TOOL_SHELL.nextSteps.newTabNote);
    // Before the car tools, right under the heading.
    expect(at(C.explainer.href)).toBeLessThan(at("/cong-cu/thue-mua-xe/"));
  });

  it("opens the fuel tool in a new tab and leaves the lease tool in this one", () => {
    const fuel = tagFor("/cong-cu/chi-phi-nhien-lieu/");
    expect(fuel).toContain('target="_blank"');
    expect(fuel).toContain('rel="noopener noreferrer"');
    expect(fuel).toContain(TOOL_SHELL.nextSteps.newTabNote);
    expect(tagFor("/cong-cu/thue-mua-xe/")).not.toContain("_blank");
  });

  it("puts the article link in the named-example line with the same new-tab note", () => {
    const source = read("components/auto-loan-calculator.tsx");
    const line = source.slice(source.indexOf("data-auto-named-example"), source.indexOf("data-auto-example-offer"));
    expect(line).toContain("href={example.articleHref}");
    expect(line).toContain('target="_blank"');
    expect(line).toContain('rel="noopener noreferrer"');
    expect(line).toContain("TOOL_SHELL.nextSteps.newTabNote");
  });
});

describe("the catalogue link is named Tất cả công cụ on the car page only", () => {
  it("keeps Quay lại by default and the same destination and accessible name", () => {
    const shared = renderToStaticMarkup(createElement(CalculatorHeading, { title: "T", lede: "L" }));
    const car = renderToStaticMarkup(createElement(CalculatorHeading, { title: "T", lede: "L", backLabel: C.hubLinkLabel }));
    expect(shared).toContain(`${CALCULATOR_HUB.backLabel}</a>`);
    expect(car).toContain("Tất cả công cụ</a>");
    for (const html of [shared, car]) {
      // Destination, whatever the attribute order (built export: "/cong-cu/").
      const back = html.slice(html.indexOf("<a"), html.indexOf(">", html.indexOf("<a")) + 1);
      expect(back).toContain('data-calculator-back="true"');
      expect(back).toMatch(/href="\/cong-cu\/?"/);
      expect(html).toContain(`aria-label="${CALCULATOR_HUB.backAriaLabel}"`);
    }
    // The accessible name still contains the visible words (label in name).
    expect(CALCULATOR_HUB.backAriaLabel.toLowerCase()).toContain(C.hubLinkLabel.toLowerCase());
    expect(read("app/cong-cu/vay-mua-xe/page.tsx")).toContain("backLabel={C.hubLinkLabel}");
    expect(CALCULATOR_HUB.backLabel).toBe("Quay lại");
  });
});
