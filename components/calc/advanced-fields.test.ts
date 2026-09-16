/**
 * The advanced-fields panel's open state.
 *
 * The reproduced defect: `open` was a pure function of `settings`, so React
 * re-applied it on every render — and zeroing the LAST active field inside
 * the panel closed it mid-edit, taking away the box the reader was working
 * in. On the advanced APR page, clearing the last cash fee made the
 * financed-fee input disappear.
 *
 * The four behaviours the latch has to keep, asserted on the SOURCE where the
 * state machine lives plus the first rendered attribute, which is the part a
 * server render can see:
 *
 * 1. the first render is a pure function of the props, so SSR and the first
 *    client render agree on a prefilled form;
 * 2. an active setting forces the panel open;
 * 3. nothing forces it closed except the reader;
 * 4. a setting becoming active again re-opens it.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";

/** Props without `children`, which `createElement` supplies positionally. */
type PanelProps = Omit<ComponentProps<typeof AdvancedFields>, "children">;

function render(settings: DisclosedSetting[]): string {
  // Children as the third ARGUMENT, not as a prop: `react/no-children-prop`
  // is a lint error and the baseline is "no new problems beyond the three".
  // `AdvancedFields` requires `children`, so the props are typed without it
  // and the cast says which overload is being used.
  const props: PanelProps = { title: "Phí kèm theo", settings };
  return renderToStaticMarkup(
    createElement(
      AdvancedFields,
      props as ComponentProps<typeof AdvancedFields>,
      createElement("p", null, "field"),
    ),
  );
}

const ACTIVE: DisclosedSetting[] = [
  { key: "fee", label: "Phí", value: "30.000.000 ₫", active: true },
];
const IDLE: DisclosedSetting[] = [
  { key: "fee", label: "Phí", value: "0 ₫", active: false },
];

describe("the first render", () => {
  it("opens the panel when something inside it is active", () => {
    const markup = render(ACTIVE);
    expect(markup).toContain("<details open");
    // And says what is active on the collapsed line itself.
    expect(markup).toContain("30.000.000 ₫");
  });

  it("leaves it closed when nothing is active", () => {
    const markup = render(IDLE);
    expect(markup).not.toContain("<details open");
    expect(markup).toContain("<details");
  });

  it("is a pure function of the props, so SSR and hydration agree", () => {
    // Rendered twice from the same props: the attribute cannot depend on
    // anything but `settings` on the first pass.
    expect(render(ACTIVE)).toBe(render(ACTIVE));
    expect(render(IDLE)).toBe(render(IDLE));
  });
});

describe("the open latch", () => {
  const source = readFileSync(
    new URL("../../components/calc/advanced-fields.tsx", import.meta.url),
    "utf8",
  );

  it("never derives `open` from the settings alone after the first render", () => {
    // `open={shouldOpen(settings)}` was the defect: React re-applies it, so
    // a value crossing to zero pulled the panel shut.
    expect(source).not.toMatch(/open=\{shouldOpen\(settings\)\}/);
    expect(source).toContain("forcedOpen || readerOpen");
  });

  it("seeds the reader's state from the props rather than from a constant", () => {
    // `useState(false)` would render closed on the client's first pass for a
    // prefilled form the server rendered open — a hydration mismatch.
    expect(source).toContain("useState(forcedOpen)");
  });

  it("records the reader's own toggle, so a closed panel stays closed", () => {
    expect(source).toContain("onToggle");
    expect(source).toContain("setReaderOpen(event.currentTarget.open)");
  });

  it("uses no effect, so it adds no set-state-in-effect problem", () => {
    // `react-hooks/set-state-in-effect` is exactly the rule behind two of the
    // three baseline lint problems; this fix must not add a third.
    expect(source).not.toContain("useEffect");
  });
});
