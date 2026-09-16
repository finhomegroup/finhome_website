/**
 * `markupRegion` — the shared bound for live-region containment assertions.
 *
 * These cases are written against the three bugs the ad-hoc bounds actually
 * had, not against the happy path: a nested element inside the region, a
 * close tag of a DIFFERENT type appearing before the region ends, and an
 * absent marker. If any of them regress, four rendered-markup tests in this
 * repo silently stop checking what they claim to check.
 */
import { describe, expect, it } from "vitest";
import { markupRegion } from "./markup-region";

describe("markupRegion", () => {
  it("tracks nesting instead of stopping at the first close tag", () => {
    // The `html.indexOf("</div>", live)` bug: the first `</div>` after the
    // marker closes the inner div, so a negative assertion under-checks.
    const html =
      '<div data-live="1"><div><span>x</span></div><table>1</table></div>' +
      "<table>outside</table>";
    const region = markupRegion(html, 'data-live="1"');
    expect(region).toContain("<table>1</table>");
    expect(region).not.toContain("outside");
  });

  it("is not fooled by a close tag of another element type", () => {
    // The `live.indexOf("</dl>")` bug: the marker is on a `<div>`, and the
    // `</dl>` that bound it belonged to something else entirely.
    const html =
      '<div data-live="1">safe<dl><dt>a</dt></dl></div><table>outside</table>';
    const region = markupRegion(html, 'data-live="1"');
    expect(region).not.toContain("<table");
    expect(region).toContain("<dl>");
  });

  it("returns null for an absent marker rather than a widened slice", () => {
    // The `slice(0, -1)` bug: a -1 bound turned a POSITIVE assertion into one
    // against the whole page, which passes regardless.
    expect(markupRegion("<div>nothing here</div>", 'data-live="1"')).toBeNull();
  });

  it("returns null when the element never closes", () => {
    expect(markupRegion('<div data-live="1">unterminated', 'data-live="1"')).toBeNull();
  });

  it("does not count a tag whose name merely starts the same", () => {
    const html = '<div data-live="1"><divider></divider>x</div><table>out</table>';
    expect(markupRegion(html, 'data-live="1"')).not.toContain("out");
  });

  it("bounds a non-div element when told which tag it is", () => {
    const html = '<dl data-live="1"><dt>a</dt></dl><table>out</table>';
    const region = markupRegion(html, 'data-live="1"', "dl");
    expect(region).toContain("<dt>a</dt>");
    expect(region).not.toContain("out");
  });
});
