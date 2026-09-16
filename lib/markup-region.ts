/**
 * Extract the markup inside an element, bounded by its own nesting.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `markup-region.test.ts`.
 *
 * WHY THIS EXISTS. Several rendered-markup tests assert that something is, or
 * is not, inside the results live region — docs §4 requires exactly one live
 * region per page and forbids a table inside it, because a long schedule in a
 * polite region re-announces on every keystroke. Each test had grown its own
 * bound from the live marker, and by the time there were four of them, three
 * distinct bugs were in play:
 *
 * - `live.indexOf("</dl>")` — the marker sits on a `<div>`, so the region has
 *   no `</dl>` of its own. On one page the first one was 16.054 characters
 *   later, inside `ResultTable`'s `mobileCards` branch, and the containment
 *   check passed only because that `<dl>` happened to close before the
 *   `<table>` opened. On a page whose table sets no `mobileCards` the bound
 *   came back -1.
 * - `slice(0, -1)` from that -1 — which silently widens a POSITIVE assertion
 *   to the whole page, so it passes no matter where the expected text is.
 * - `html.indexOf("</div>", live)` — the first `</div>` after the marker
 *   closes the first NESTED div, not the region, so a NEGATIVE assertion
 *   under-checks and would miss a table deeper inside.
 *
 * All three are the same mistake: bounding a region by a close tag found
 * textually rather than by counting depth. So count depth, once, here.
 *
 * Deliberately string-based rather than a DOM parse: these tests run
 * `renderToStaticMarkup` in the runner's plain `node` environment, and the
 * point is to assert on the exact bytes a reader's browser receives.
 */

/** A tag name that can bound a region, without its angle bracket. */
type Tag = "div" | "dl" | "ul" | "ol" | "section" | "table" | "figure";

/**
 * The markup between an element's own open and close tags, marker included.
 *
 * `marker` is any substring that appears inside the opening tag — an
 * attribute is the useful case, e.g. `data-results-live="true"`. `tag` is that
 * element's tag name, which the caller knows and the marker does not carry.
 *
 * Returns `null` rather than a partial slice when the marker is absent or the
 * element never closes, so a caller cannot accidentally assert against a
 * silently widened region. Check for `null` explicitly; `expect(region).not
 * .toBeNull()` is the guard those four tests were each missing.
 */
export function markupRegion(
  html: string,
  marker: string,
  tag: Tag = "div",
): string | null {
  const at = html.indexOf(marker);
  if (at === -1) return null;

  const open = html.lastIndexOf(`<${tag}`, at);
  if (open === -1) return null;

  const openTag = `<${tag}`;
  const closeTag = `</${tag}`;
  let depth = 0;

  for (let i = open; i < html.length; i += 1) {
    if (html.startsWith(closeTag, i)) {
      depth -= 1;
      if (depth === 0) return html.slice(open, i);
    } else if (html.startsWith(openTag, i)) {
      // Guard against matching `<divider>` when counting `<div>`: a real tag
      // is followed by whitespace, `>` or `/`.
      const next = html[i + openTag.length];
      if (next === undefined || /[\s/>]/.test(next)) depth += 1;
    }
  }

  return null;
}
