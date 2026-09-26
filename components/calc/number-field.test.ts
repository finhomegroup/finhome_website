/**
 * `NumberField`'s opt-in live formatting.
 *
 * The runner has no DOM, so the keystroke behaviour itself is pinned in
 * `lib/calc/number-input.test.ts` on the pure function the field calls. What
 * this file can see is the first render — which must be a pure function of
 * the props, because every calculator is prerendered at its defaults — and
 * the source, where the wiring the pure test cannot reach has to hold.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NumberField } from "@/components/calc/number-field";

function render(props: Partial<ComponentProps<typeof NumberField>>): string {
  return renderToStaticMarkup(
    createElement(NumberField, {
      label: "Số tiền",
      unit: "₫",
      help: "Đơn vị đồng.",
      value: "500.000.000",
      onValueChange: () => {},
      ...props,
    }),
  );
}

describe("the first render", () => {
  it("marks a formatted field so the markup says which grammar it follows", () => {
    expect(render({ format: "money" })).toContain('data-format="money"');
    expect(render({ format: "rate" })).toContain('data-format="rate"');
  });

  it("marks nothing on a field that did not opt in", () => {
    expect(render({})).not.toContain("data-format");
  });

  it("shows the value it was given, untouched, so SSR and hydration agree", () => {
    // Formatting happens on the reader's edit, never on the stored string:
    // the defaults are already in Vietnamese grammar and a stored value that
    // moved under the reader's cursor on hydration would be a mismatch.
    const markup = render({ format: "money", value: "500000" });
    expect(markup).toContain('value="500000"');
    expect(render({ format: "money" })).toBe(render({ format: "money" }));
  });

  it("keeps the text input and the decimal keypad either way", () => {
    for (const markup of [render({ format: "money" }), render({})]) {
      expect(markup).toContain('type="text"');
      expect(markup).toContain('inputMode="decimal"');
    }
  });
});

describe("the wiring", () => {
  const source = readFileSync(
    new URL("../../components/calc/number-field.tsx", import.meta.url),
    "utf8",
  );

  it("formats through the pure function, so the caret rules have one home", () => {
    expect(source).toContain("reformatInput(");
    expect(source).toContain("setSelectionRange(");
  });

  it("reads the edit's inputType, which is how Backspace and Delete on a dot differ", () => {
    expect(source).toContain("inputType");
  });

  it("leaves an IME composition alone until it ends", () => {
    expect(source).toContain("onCompositionStart");
    expect(source).toContain("onCompositionEnd");
  });

  it("uses no effect, so it adds no set-state-in-effect problem", () => {
    // `react-hooks/set-state-in-effect` is exactly the rule behind two of the
    // three baseline lint problems; this change must not add a third.
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("useLayoutEffect");
  });
});
