// The guard behind `content/glossary.ts`'s first-use convention.
//
// WHAT IT CHECKS. For every term declared `enforcement: "first-use"`, in every
// body where that term occurs, the window around its FIRST occurrence must
// contain the term's declared cues — the mechanism in words. A body where a
// gloss would be padding is exempted by name, with a reason, in the glossary
// itself.
//
// WHY A CUE AND NOT A MARKER. See the header of `content/glossary.ts`: a
// marker records the claim that a gloss exists and stays green when the gloss
// is deleted. Cues fail both when the gloss is missing and when it says
// nothing.
//
// NON-VACUITY IS ASSERTED, NOT ASSUMED. Earlier in this project a regex sweep
// reported "0 shouted words" on two files full of them, because it pulled
// string literals out before testing them. So this file asserts floors on
// everything it depends on: how many bodies it found, how much text it
// extracted from each, how many enforced terms exist, how many first
// occurrences it actually checked, and — the one that would have caught that
// earlier bug — that every enforced term occurs SOMEWHERE. A declared term
// that matches nothing is a typo or dead weight, and either way the sweep
// covering it is imaginary.
//
// It also self-tests the detector on synthetic text, so a refactor that makes
// `glossWindow` return "" (and therefore passes nothing but fails nothing
// either, since an empty window fails) or makes `hasCues` return true
// unconditionally is caught by the test rather than by a reader.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import {
  GLOSSARY,
  enforcedTerms,
  referenceTerms,
  type GlossBodyId,
  type GlossaryTerm,
} from "@/content/glossary";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { newsPosts } from "@/content/posts";

/**
 * One sweepable body: an ordered list of prose blocks.
 *
 * A "block" is a markdown paragraph (for a news body) or one addressable piece
 * of article prose (for an education article). Blocks are what the gloss
 * window is measured in.
 */
type Body = { id: GlossBodyId; label: string; blocks: string[] };

/** NFC so a decomposed diacritic in one corpus cannot silently miss a term. */
const norm = (s: string) => s.normalize("NFC").toLowerCase();

// --- the corpus ------------------------------------------------------------

const NEWS_DIR = "content/posts";

function newsBodies(): Body[] {
  return readdirSync(NEWS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = readFileSync(`${NEWS_DIR}/${file}`, "utf8");
      return {
        id: `news:${slug}` as GlossBodyId,
        label: `content/posts/${file}`,
        // Markdown paragraphs. A bullet list with no blank lines inside it is
        // one block, which is the right unit here: a gloss in a neighbouring
        // bullet of the same list is still local to first use.
        blocks: raw
          .split(/\n\s*\n/)
          .map((block) => block.trim())
          .filter((block) => block.length > 0),
      };
    });
}

/**
 * An education article's prose, in the order the page renders it.
 *
 * Read off `components/education/education-article.tsx`: short answer,
 * household (items then note), sections, visual reading, exercise, limits,
 * sources, provenance. The visual's own assumptions and table are NOT here:
 * they are produced by the calculator engine from the declared hypothetical,
 * so no editor can put a gloss in them.
 */
function educationBlocks(article: (typeof EDUCATION_ARTICLES)[number]): string[] {
  return [
    article.question,
    ...article.shortAnswer,
    article.household.title,
    ...article.household.items.map((item) => `${item.label}: ${item.value}`),
    article.household.note,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    article.visualReading,
    article.exercise.title,
    article.exercise.intro,
    ...article.exercise.steps,
    article.exercise.change,
    article.exercise.check,
    article.limits.title,
    ...article.limits.items,
    article.sources.intro,
    ...article.sources.items.map((source) => `${source.label}: ${source.note}`),
    article.provenance,
  ];
}

function educationBodies(): Body[] {
  return EDUCATION_ARTICLES.map((article) => ({
    id: `edu:${article.planId}` as GlossBodyId,
    label: `education ${article.planId} (${article.slug})`,
    blocks: educationBlocks(article),
  }));
}

const NEWS = newsBodies();
const EDU = educationBodies();
const BODIES = [...NEWS, ...EDU];

// --- detection -------------------------------------------------------------

/**
 * Terms that CONTAIN this one, longest first.
 *
 * Longest match wins, so `biên lãi suất netto` takes the occurrence in the MB
 * interview and `biên lãi suất` does not — the two are different quantities
 * and cannot share a gloss.
 */
function longerTerms(term: GlossaryTerm): GlossaryTerm[] {
  return GLOSSARY.filter(
    (other) =>
      other.term !== term.term && norm(other.term).includes(norm(term.term)),
  );
}

/** Every index in `text` where `needle` starts. */
function indexesOf(text: string, needle: string): number[] {
  const out: number[] = [];
  for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + 1)) {
    out.push(i);
  }
  return out;
}

/**
 * The index of the block holding the term's first own occurrence, or -1.
 *
 * "Own" means not swallowed by a longer declared term at the same position.
 */
function firstOwnBlock(body: Body, term: GlossaryTerm): number {
  const needle = norm(term.term);
  const longer = longerTerms(term).map((other) => norm(other.term));
  for (let b = 0; b < body.blocks.length; b += 1) {
    const text = norm(body.blocks[b]);
    for (const at of indexesOf(text, needle)) {
      const swallowed = longer.some((other) =>
        indexesOf(text, other).some(
          (start) => start <= at && at + needle.length <= start + other.length,
        ),
      );
      if (!swallowed) return b;
    }
  }
  return -1;
}

/**
 * The text a gloss may live in: one block of lead-in, the block itself, and
 * two of follow-through.
 *
 * Asymmetric on purpose. The Côn Đảo post is the model for "after": the term
 * lands in the opening paragraph and the gloss is the paragraph below it. One
 * block BEFORE is allowed because in an education article a term's first
 * occurrence can be a table label or a heading, whose explanation sits in the
 * text above it. Two after, rather than one, because a heading counts as a
 * block and can sit between the term and the paragraph that explains it.
 */
function glossWindow(body: Body, at: number): string {
  return body.blocks.slice(Math.max(0, at - 1), at + 3).join("\n\n");
}

/** The declared cues actually present in `window`. */
function cuesFound(window: string, term: GlossaryTerm): string[] {
  const text = norm(window);
  return term.cues.filter((cue) => text.includes(norm(cue)));
}

function isGlossed(window: string, term: GlossaryTerm): boolean {
  return cuesFound(window, term).length >= (term.minCues ?? 1);
}

const exemptions = (term: GlossaryTerm) => term.exemptions ?? [];
const isExempt = (term: GlossaryTerm, id: GlossBodyId) =>
  exemptions(term).some((entry) => entry.body === id);

/** Every (term, body) pair the guard is responsible for. */
type Duty = { term: GlossaryTerm; body: Body; block: number };

function duties(): Duty[] {
  const out: Duty[] = [];
  for (const term of enforcedTerms()) {
    for (const body of BODIES) {
      const block = firstOwnBlock(body, term);
      if (block >= 0) out.push({ term, body, block });
    }
  }
  return out;
}

const DUTIES = duties();

// --- non-vacuity -----------------------------------------------------------
//
// Floors, not exact counts. A new post or a thirteenth article must not turn
// this file red; an empty sweep must.

describe("the sweep is not vacuous", () => {
  it("found the whole news corpus on disk, and nothing else", () => {
    // Derived from the directory and from POSTS, never quoted from prose.
    const onDisk = NEWS.map((body) => body.id.replace("news:", "")).sort();
    const registered = newsPosts()
      .map((post) => post.slug)
      .sort();
    expect(onDisk.length).toBeGreaterThan(100);
    expect(onDisk).toEqual(registered);
  });

  it("found every education article", () => {
    expect(EDU.length).toBe(EDUCATION_ARTICLES.length);
    expect(EDU.length).toBeGreaterThanOrEqual(10);
  });

  it("extracted real text from every body", () => {
    // THE CHECK THAT WOULD HAVE CAUGHT THE "0 shouted words" SWEEP: an
    // extractor that returns nothing must fail here, not report zero hits.
    for (const body of BODIES) {
      const text = body.blocks.join("\n\n");
      expect(body.blocks.length, body.label).toBeGreaterThanOrEqual(3);
      expect(text.length, body.label).toBeGreaterThan(400);
    }
    const shortestEdu = Math.min(
      ...EDU.map((body) => body.blocks.join("\n\n").length),
    );
    expect(shortestEdu).toBeGreaterThan(2000);
  });

  it("enforces a real number of terms and checks a real number of occurrences", () => {
    expect(enforcedTerms().length).toBeGreaterThanOrEqual(10);
    expect(referenceTerms().length).toBeGreaterThanOrEqual(1);
    // The floors are on the ENFORCED tier, so the glossary cannot be emptied
    // by demoting every entry to `reference`.
    expect(DUTIES.length).toBeGreaterThanOrEqual(40);
  });

  it("declares no term that occurs nowhere in the corpus", () => {
    for (const term of enforcedTerms()) {
      const hits = DUTIES.filter((duty) => duty.term.term === term.term).length;
      expect(
        hits,
        `"${term.term}" is declared \`first-use\` but occurs in no body — ` +
          "it is a typo, or the corpus changed and the entry is dead weight",
      ).toBeGreaterThan(0);
    }
  });

  it("detects a gloss only when the mechanism is there", () => {
    // The detector, on synthetic text. Both directions, so neither a
    // permanently-true nor a permanently-false `isGlossed` survives.
    const thueMua = GLOSSARY.find((entry) => entry.term === "thuê mua")!;
    const vacuous: Body = {
      id: "news:synthetic",
      label: "synthetic",
      blocks: ["Giá thuê mua được công bố.", "Thuê mua là một hình thức nhà ở xã hội."],
    };
    const real: Body = {
      id: "news:synthetic",
      label: "synthetic",
      blocks: [
        "Giá thuê mua được công bố.",
        "Người thuê mua trả trước một phần giá trị căn nhà, phần còn lại trả dần hằng tháng, và chỉ được sang tên sau khi hết hạn hợp đồng.",
      ],
    };
    expect(firstOwnBlock(vacuous, thueMua)).toBe(0);
    expect(isGlossed(glossWindow(vacuous, 0), thueMua)).toBe(false);
    expect(isGlossed(glossWindow(real, 0), thueMua)).toBe(true);
    // One half of the mechanism is not enough for a term that declares two.
    expect(
      isGlossed("Người mua trả trước một phần giá trị căn nhà.", thueMua),
    ).toBe(false);
    // And the window really is bounded: a gloss four blocks away is missed.
    const faraway: Body = {
      id: "news:synthetic",
      label: "synthetic",
      blocks: [
        "Giá thuê mua được công bố.",
        "Một đoạn khác.",
        "Một đoạn khác nữa.",
        "Đoạn thứ tư.",
        real.blocks[1],
      ],
    };
    expect(isGlossed(glossWindow(faraway, 0), thueMua)).toBe(false);
  });

  it("resolves an overlapping term by its longest form", () => {
    const margin = GLOSSARY.find((entry) => entry.term === "biên lãi suất")!;
    const nim = GLOSSARY.find(
      (entry) => entry.term === "biên lãi suất netto",
    )!;
    const body: Body = {
      id: "news:synthetic",
      label: "synthetic",
      blocks: ["Biên lãi suất netto (NIM) được dự báo thu hẹp.", "Đoạn hai.", "Đoạn ba."],
    };
    // The longer term owns the occurrence; the shorter one sees nothing here.
    expect(firstOwnBlock(body, nim)).toBe(0);
    expect(firstOwnBlock(body, margin)).toBe(-1);
  });
});

// --- the glossary's own shape ---------------------------------------------

describe("every glossary entry is usable", () => {
  it.each(GLOSSARY.map((entry) => [entry.term, entry] as const))(
    "%s has a mechanism gloss and says where it applies",
    (_term, entry) => {
      // Long enough to be a mechanism rather than a synonym.
      expect(entry.gloss.length, entry.term).toBeGreaterThan(60);
      expect(entry.where.length, entry.term).toBeGreaterThan(40);
      expect(entry.term.trim()).toBe(entry.term);
      expect(entry.term).toBe(entry.term.toLowerCase());
      if (entry.enforcement === "first-use") {
        expect(entry.cues.length, entry.term).toBeGreaterThan(0);
        expect(entry.cues.length, entry.term).toBeGreaterThanOrEqual(
          entry.minCues ?? 1,
        );
      } else {
        // The reference tier still has to carry a real gloss — it is written
        // for whoever writes the next post — and has to say why it is not
        // enforced, which is what `where` is for.
        expect(entry.cues, entry.term).toEqual([]);
      }
    },
  );

  it("declares each term once", () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("gives every exemption a body that exists and really contains the term", () => {
    // The WIDE_TABLE_PENDING rule from scripts/check-built-markup.mjs: tracked
    // debt that checks nothing is worse than no entry, because it looks
    // deliberate. An exemption for a body that no longer uses the term, or
    // that was renamed, fails here.
    const byId = new Map(BODIES.map((body) => [body.id, body]));
    for (const term of GLOSSARY) {
      for (const entry of exemptions(term)) {
        const body = byId.get(entry.body);
        expect(body, `${term.term}: exemption names no such body ${entry.body}`)
          .toBeDefined();
        expect(
          firstOwnBlock(body!, term),
          `${term.term}: exemption for ${entry.body} is stale — the term no longer occurs there`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          entry.reason.length,
          `${term.term}: exemption for ${entry.body} has no real reason`,
        ).toBeGreaterThan(80);
      }
    }
  });
});

// --- the sweep itself ------------------------------------------------------

describe("every declared term is glossed on first use", () => {
  it("has no ungloss[ed], unexempted first occurrence anywhere", () => {
    const missing: string[] = [];
    for (const { term, body, block } of DUTIES) {
      if (isExempt(term, body.id)) continue;
      const window = glossWindow(body, block);
      if (isGlossed(window, term)) continue;
      const found = cuesFound(window, term);
      missing.push(
        `${body.label}: "${term.term}" first occurs in block ${block} with ` +
          `${found.length}/${term.minCues ?? 1} required cue(s) nearby ` +
          `(found: ${found.length ? found.join(" / ") : "none"}). ` +
          `Gloss it there — "${term.gloss}" — or add an exemption with a reason ` +
          "to content/glossary.ts.",
      );
    }
    expect(
      missing,
      `${missing.length} term occurrence(s) are not glossed:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("glosses a term at most once per body", () => {
    // The convention is ONE gloss per body per term. A second one is not a
    // failure the build should block on, but the cue count is a cheap proxy
    // for a body that repeats the whole explanation, so it is bounded.
    for (const { term, body, block } of DUTIES) {
      if (isExempt(term, body.id)) continue;
      const after = body.blocks.slice(block + 3).join("\n\n");
      const repeats = cuesFound(after, term).length;
      expect(
        repeats,
        `${body.label} repeats the "${term.term}" gloss well after first use`,
      ).toBeLessThanOrEqual(2);
    }
  });
});
