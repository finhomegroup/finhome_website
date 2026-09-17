import { SOCIAL_HOUSING as C } from "@/content/calculators/social-housing";

/**
 * The two statutory conditions the calculator cannot compute, plus the one it
 * can, as a checklist the reader confirms themselves.
 *
 * NOT a `"use client"` component and it must stay that way: there is no state
 * here and no interaction, so making it a client component would ship
 * JavaScript to render a list. The same reason the education collection's four
 * chart components are server-rendered.
 *
 * WHY THIS EXISTS AS A COMPONENT RATHER THAN PROSE. The income test is
 * arithmetic and the other two are documentary, and a reader who cannot tell
 * which is which will read a computed tầm giá as an eligibility verdict. Three
 * items with explicit "TÍNH ĐƯỢC" / "KHÔNG tính được" labels make the boundary
 * a structural fact of the page rather than a sentence that can be skimmed
 * past. It sits BELOW the calculator, after the reader has their figure, while
 * the route's `notice` states the same boundary above it — the figure is what
 * they came for, and the limit has to reach them at both ends.
 *
 * The `limits` block follows the register the education collection already
 * established with its own "Bài này không trả lời được gì" section, which is
 * the most valuable convention in this product: naming what a page cannot
 * settle is what makes what it does settle believable.
 */
export function SocialHousingConditions() {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-medium text-ink">
        {C.conditions.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        {C.conditions.intro}
      </p>

      {/* A real `<dl>`: each item is a term and its description, which is what
          a screen reader should hear rather than two unrelated paragraphs. */}
      <dl className="mt-4 space-y-4">
        {C.conditions.items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-bg-soft p-4">
            <dt className="text-sm font-medium text-ink">{item.label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-2">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-ink-2">
        {C.conditions.note}
      </p>

      <h3 className="mt-8 text-xs font-medium uppercase tracking-wide text-ink-3">
        {C.limits.title}
      </h3>
      {/*
        `list-disc … pl-5`, matching `EducationArticleBody`'s own limits block.
        This shipped as `space-y-1` with no markers, and at 390 px the four
        items read as ONE run-on block of prose rather than four separate
        things a reader can count — which defeats the point of the section.
        Caught by looking at the rendered page, not by any test: every
        assertion about this block passed, because the text was all present.
      */}
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        {C.limits.items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-ink-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
