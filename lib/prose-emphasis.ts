/**
 * Editor-selected semantic emphasis inside a paragraph of prose.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `prose-emphasis.test.ts`.
 *
 * WHY THIS SHAPE. The founder's requirement is that a reader should be able to
 * see the distinction an article is about without reading every sentence. The
 * three obvious implementations are all wrong for this codebase:
 *
 * - **Markup inside the content string** (`"…<strong>không</strong>…"`) needs
 *   `dangerouslySetInnerHTML` to render, which is an HTML-injection surface on
 *   a page whose text is editorial content. It also breaks every consumer that
 *   treats a paragraph as text: the search index, the JSON-LD description, and
 *   what a reader gets when they copy a paragraph.
 * - **A span tree as the content type** (`(string | {strong: string})[]`) is
 *   safe, but it makes the paragraph itself a structure — so every existing
 *   test, every plain-text consumer and every content edit has to reassemble
 *   the sentence to read it, and the same sentence can then exist in two
 *   spellings.
 * - **An algorithm** — bold every number, bold the first half of each word,
 *   bold the first sentence — cannot know which distinction the paragraph is
 *   about. Bolding every number in this suite's prose would emphasise the
 *   assumptions and bury the conclusion, and a partial-word rule invents
 *   typography that is not language.
 *
 * So: the paragraph stays ONE PLAIN STRING, and the phrases to emphasise are
 * declared beside it as data. `emphasise()` splits the string on those exact
 * phrases and returns spans. The invariant that makes this safe is checkable
 * and is checked: **joining the spans' text reproduces the input exactly**, so
 * nothing can be lost, reordered or invented, and the renderer emits React
 * elements rather than markup, so a paragraph containing `<script>` renders as
 * the characters `<script>`.
 *
 * FOUR RULES, each with a reason:
 *
 * 1. **Exact, case-sensitive, whole-phrase matching.** Vietnamese diacritics
 *    are meaning, and a case-insensitive match would emphasise a word at the
 *    start of a different sentence. The editor writes the phrase they mean.
 * 2. **Longest phrase first.** Two declared phrases can overlap ("chi phí
 *    ròng" inside "chi phí ròng theo tháng"); claiming the longer one first
 *    means the editor's more specific selection wins and no span nests.
 * 3. **At most one emphasis per phrase per paragraph**, at its first
 *    occurrence. A phrase like "không" appears many times in a paragraph of
 *    Vietnamese; emphasising all of them is the "bold everything" failure in
 *    another form. An editor who wants two occurrences marked declares the
 *    surrounding words, which are different strings.
 * 4. **A phrase that does not occur is silently skipped HERE and a failing
 *    test elsewhere.** This function cannot know whether a miss is a typo or a
 *    phrase meant for a sibling paragraph, so it renders the text unharmed;
 *    `content/education/articles.test.ts` is what proves every declared phrase
 *    is actually found in the block it was declared for.
 */

/** One run of characters, with whether it is emphasised. */
export type ProseSpan = {
  text: string;
  /** True for an editor-selected phrase, rendered as `<strong>`. */
  emphasis: boolean;
};

/** A claimed range inside the paragraph. */
type Claim = { start: number; end: number };

/**
 * Split a paragraph into emphasised and plain spans.
 *
 * Returns a single non-emphasised span for a paragraph with no matches, and
 * an empty array only for an empty string. `spans.map(s => s.text).join("")`
 * always equals `paragraph` — the invariant the module exists to keep.
 */
export function emphasise(
  paragraph: string,
  phrases: readonly string[] = [],
): ProseSpan[] {
  if (paragraph === "") return [];

  // Longest first, so a more specific selection claims its range before a
  // shorter phrase inside it can. `[...]` because the caller's array is
  // readonly and sorting in place would mutate content.
  const ordered = [...new Set(phrases)]
    .filter((phrase) => phrase !== "")
    .sort((a, b) => b.length - a.length);

  const claims: Claim[] = [];
  for (const phrase of ordered) {
    // Scan forward until an occurrence that does not overlap an existing
    // claim. A phrase whose only occurrence sits inside a longer emphasised
    // phrase is already visually emphasised, so it is dropped rather than
    // splitting the longer span.
    let from = 0;
    for (;;) {
      const start = paragraph.indexOf(phrase, from);
      if (start === -1) break;
      const end = start + phrase.length;
      const overlaps = claims.some(
        (claim) => start < claim.end && end > claim.start,
      );
      if (!overlaps) {
        claims.push({ start, end });
        break;
      }
      from = start + 1;
    }
  }

  if (claims.length === 0) return [{ text: paragraph, emphasis: false }];

  claims.sort((a, b) => a.start - b.start);

  const spans: ProseSpan[] = [];
  let cursor = 0;
  for (const claim of claims) {
    if (claim.start > cursor) {
      spans.push({
        text: paragraph.slice(cursor, claim.start),
        emphasis: false,
      });
    }
    spans.push({
      text: paragraph.slice(claim.start, claim.end),
      emphasis: true,
    });
    cursor = claim.end;
  }
  if (cursor < paragraph.length) {
    spans.push({ text: paragraph.slice(cursor), emphasis: false });
  }
  return spans;
}

/**
 * Which of `phrases` do NOT occur in any of `paragraphs`.
 *
 * The content tests' side of rule 4: a declared phrase that matches nothing is
 * a typo, a phrase that drifted when a sentence was reworded, or emphasis
 * attached to the wrong block — all three are editorial defects that should
 * fail a test rather than silently render as ordinary text.
 */
export function missingPhrases(
  paragraphs: readonly string[],
  phrases: readonly string[],
): string[] {
  return phrases.filter(
    (phrase) => !paragraphs.some((paragraph) => paragraph.includes(phrase)),
  );
}

/**
 * How many characters of a block are emphasised, as a share of its length.
 *
 * Exists so a test can hold the line against the failure mode this whole
 * mechanism is meant to avoid: emphasis everywhere, which is emphasis nowhere.
 * Returns 0 for an empty block.
 */
export function emphasisShare(
  paragraphs: readonly string[],
  phrases: readonly string[],
): number {
  const total = paragraphs.reduce((sum, p) => sum + p.length, 0);
  if (total === 0) return 0;
  const marked = paragraphs.reduce(
    (sum, paragraph) =>
      sum +
      emphasise(paragraph, phrases)
        .filter((span) => span.emphasis)
        .reduce((inner, span) => inner + span.text.length, 0),
    0,
  );
  return marked / total;
}
