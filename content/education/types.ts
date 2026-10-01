// The shape of a "Mua nhà bằng con số" article.
//
// An article is DATA, not markdown, for three reasons the collection depends
// on:
//
// 1. Its visual is computed by the production engine from a declared
//    hypothetical (`visual`), so the figures in the prose and the figures in
//    the picture cannot drift apart. A markdown body would hold a hand-typed
//    number.
// 2. Its exercise names real UI labels on a real route, and a test can check
//    that the route exists and is live.
// 3. The declared hypothetical, the limits and the sources are separate
//    fields rather than paragraphs, so a test can assert that none of them is
//    missing — which is what stops a stub shipping as an article.
//
// READING COMPREHENSION (founder addition, 2026-09-15). A paragraph is still
// ONE PLAIN STRING. The phrases to emphasise are declared beside it in
// `emphasis`, and `lib/prose-emphasis.ts` explains at length why that is the
// shape rather than markup in the string, a span tree, or an algorithm. The
// consequence worth stating here: the text a reader copies, the text the
// search index holds and the text in the JSON-LD are all still the same
// string, so visible emphasis cannot drift away from the content.
//
// What an editor is choosing is the DISTINCTION the reader should leave with —
// "khoản trả thấp hơn" is not "tổng chi phí thấp hơn" — together with the
// condition attached to it. Not every number, not a whole sentence, and never
// a marketing claim dressed as emphasis.

import type { EducationVisualSpec } from "@/lib/calc/charts/education-visual";
import type { EducationGroupId } from "@/content/education/groups";

export type EducationArticle = {
  /** URL slug; the article lives at /blog/<slug>/. */
  slug: string;
  /** Exactly one group. See groups.ts for the boundary rule. */
  group: EducationGroupId;
  /** The row in the editorial plan this implements, for traceability. */
  planId: string;

  /** The reader's question. The page title in POSTS restates it. */
  question: string;
  /**
   * The answer, up front, with its condition attached. Two or three sentences.
   * Never a bare number without the assumption that produced it.
   */
  shortAnswer: readonly string[];
  /**
   * Phrases inside `shortAnswer` to emphasise. See the file header.
   *
   * The condition must not be separated from the conclusion it qualifies: if
   * the emphasised phrase is a verdict, the words that bound it ("trong khoảng
   * thời gian đã chọn", "theo giả định") belong in the same selection or in
   * the emphasised phrase beside it.
   */
  shortAnswerEmphasis?: readonly string[];

  /** The hypothetical, declared as such before any figure is used. */
  household: {
    title: string;
    items: readonly { label: string; value: string }[];
    /** Why these numbers and what they are not. */
    note: string;
  };

  /**
   * The body. Substantive sections, each with a real heading.
   *
   * A HEADING IS A CLAIM OR A QUESTION, not a label. A reader who scans only
   * the headings should come away with the article's argument rather than a
   * table of contents — and, because they may read nothing else, a heading
   * must not state a unit or a direction the paragraph then corrects.
   */
  sections: readonly {
    heading: string;
    paragraphs: readonly string[];
    /** Phrases inside this section's paragraphs to emphasise. */
    emphasis?: readonly string[];
    /** Observed tool capture, supplementary to the computed accessible visual. */
    media?: {
      src: string;
      alt: string;
      width: number;
      height: number;
      caption: string;
    };
    /** Short reader-facing results, also readable without the screenshot. */
    results?: { caption: string; rows: readonly { label: string; value: string }[] };
  }[];

  /** Computed by the production engine from the hypothetical above. */
  visual: EducationVisualSpec;
  /** Context-specific chart assumptions, reviewed with the article. Numbers
   * still come from the shared engine; replacing copy must retain model limits. */
  visualAssumptions?: readonly string[];
  /**
   * One sentence saying what the figure SHOWS, in the reader's terms.
   *
   * Required, and deliberately separate from the engine's own summary. The
   * engine states the figures; this states the reading — which quantity is
   * which line, what the crossing or the gap means, and what the picture does
   * NOT establish. A chart with no sentence of its own is a chart most readers
   * skip.
   */
  visualReading: string;
  /**
   * An optional illustration that introduces the question: shown after the
   * short answer and its early tool link, before the in-page contents. It
   * supplements the computed visual, never replaces it. Not a tool capture
   * (that is a section's `media`) and not a result: it holds no figure, and
   * `badge` labels it on the page. The caption explains the metaphor in
   * plain words and qualifies it briefly.
   */
  illustration?: {
    /** Smallest width, used as the `src` fallback. */
    src: string;
    /** Responsive local WebP files, `"<path> <w>w, …"`. */
    srcSet: string;
    /** The source's natural size, for the aspect ratio. */
    width: number;
    height: number;
    alt: string;
    /**
     * Overlay label on the image (C01). OMITTED for C05 and C11 (2026-10-01,
     * user direction): their `caption` is then a single small tagline under
     * the image — "Ảnh minh họa AI" — with no overlay and no provenance
     * paragraph on the page (provenance lives in the recap and the library
     * manifest).
     */
    badge?: string;
    caption: string;
    /**
     * `"inset"` (default, C01): a centred figure narrower than the column, with
     * a full sentence caption. `"full"` (C05, C11 — 2026-10-01): the full width
     * of the article column, aligned with the answer, CTA and contents, and a
     * single small tagline caption. Explicit, so the look never depends on
     * whether a badge happens to be set.
     */
    layout?: "inset" | "full";
  };

  /** Do it with your own numbers, on the real tool. */
  exercise: {
    title: string;
    intro: string;
    /** Steps that name the tool's actual field labels. */
    steps: readonly string[];
    /** Registry slug. Asserted live in `articles.test.ts`. */
    toolSlug: string;
    /** One thing to change, to see what moves. */
    change: string;
    /** A short comprehension check the reader can answer themselves. */
    check: string;
  };

  /** What this article does not settle. */
  limits: { title: string; items: readonly string[] };

  /**
   * Narrow, named sources for the CONCEPTS used — never for a current rate,
   * fee or regulation, and never quoted at length.
   */
  sources: {
    title: string;
    intro: string;
    items: readonly { label: string; url: string; note: string }[];
  };

  /**
   * Who wrote it and what has and has not been reviewed.
   *
   * No fabricated reviewer, no invented sign-off, no claim of professional
   * financial or legal review.
   */
  provenance: string;

  /** Other articles in the collection worth reading next. */
  nextSlugs: readonly string[];
};
