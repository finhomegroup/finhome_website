/**
 * `CalculatorHeading`'s opt-in `afterTitle` slot (2026-09-27, docs §1c).
 *
 * The slot is UNWRAPPED: the node it is given is the only thing between the
 * `</h1>` and the lede, and a heading given no node renders exactly what it
 * rendered before — so seventy-odd routes that never pass one cannot move.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalculatorHeading } from "@/components/calc/calculator-heading";

const props = { title: "Tiêu đề", lede: "Một dòng mở đầu." };

describe("CalculatorHeading afterTitle", () => {
  it("renders nothing between the h1 and the lede when absent", () => {
    const html = renderToStaticMarkup(createElement(CalculatorHeading, props));
    expect(html).toMatch(/<\/h1><p class="[^"]*">Một dòng mở đầu\.<\/p>/);
  });

  it("puts the given node, and only it, between the h1 and the lede", () => {
    const html = renderToStaticMarkup(
      createElement(CalculatorHeading, {
        ...props,
        afterTitle: createElement("div", { "data-slot": "hero" }, "hero"),
      }),
    );
    expect(html).toContain('</h1><div data-slot="hero">hero</div><p class=');
  });
});
