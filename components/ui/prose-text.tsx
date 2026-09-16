import { Fragment } from "react";
import { emphasise } from "@/lib/prose-emphasis";

/**
 * A paragraph of editorial prose with editor-selected phrases emphasised.
 *
 * NOT a client component and not a markdown renderer. It takes the paragraph
 * as a plain string plus the phrases an editor chose, asks the pure
 * `emphasise()` for the spans, and emits React elements — so there is no
 * `dangerouslySetInnerHTML` anywhere in this path and a paragraph containing
 * `<script>` renders as those seven characters. See `lib/prose-emphasis.ts`
 * for why the content type is a string and not a span tree.
 *
 * THE EMPHASIS STYLE IS WEIGHT AND DARKNESS, NEVER AN UNDERLINE. On this site
 * an underline means a link — the sources list underlines its anchors — so
 * underlining a non-interactive phrase would offer a click that does not
 * exist. `<strong>` also carries the meaning to a screen reader, which a
 * purely visual treatment would not, and `font-semibold text-ink` against
 * `text-ink-2` body text is distinguishable without colour.
 *
 * Renders the bare string when nothing matches, so a block with no emphasis
 * produces exactly the markup it did before this mechanism existed.
 */
export function ProseText({
  text,
  emphasis,
}: {
  text: string;
  /** Exact phrases to emphasise. See `lib/prose-emphasis.ts` for the rules. */
  emphasis?: readonly string[];
}) {
  const spans = emphasise(text, emphasis);
  if (!spans.some((span) => span.emphasis)) return <>{text}</>;

  return (
    <>
      {spans.map((span, index) =>
        span.emphasis ? (
          <strong
            // Index keys are safe here: the list is derived from static
            // editorial content and never reorders at runtime.
            key={index}
            className="font-semibold text-ink"
          >
            {span.text}
          </strong>
        ) : (
          <Fragment key={index}>{span.text}</Fragment>
        ),
      )}
    </>
  );
}
