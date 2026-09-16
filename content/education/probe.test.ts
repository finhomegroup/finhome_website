// A probe over every article's RESOLVED visual.
//
// This file started life as a throwaway script that printed each article's
// resolved chart model, so the reading sentence in `visualReading` could be
// written from the data the engine actually plots rather than from the
// article's own prose. It is kept as an assertion because the printing version
// had already caught the thing worth pinning: a reading sentence is only
// checkable if the model it describes is inspectable, and three of these
// models carry a kind the article's `visual.kind` does not name (a
// `rentBuyScenarios` spec resolves to `lines`, a `loanColumns` spec to
// `columns`).
//
// What it proves is narrow and deliberately structural: every article's visual
// resolves to something with a title, a non-placeholder summary, at least one
// plotted quantity and an accessible table. The EDITORIAL question — whether
// the sentence describes the right lines — is asserted per article in
// `reading-comprehension.test.ts`.
import { describe, expect, it } from "vitest";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";

describe("every article's visual is inspectable, so its reading is checkable", () => {
  it.each(EDUCATION_ARTICLES.map((a) => [a.planId, a] as const))(
    "%s resolves to a titled model with a real summary and a table",
    (_planId, article) => {
      const visual = resolveEducationVisual(
        article.visual,
        EDUCATION_VISUAL_LABELS,
      );

      const title = visual.kind === "chart" ? visual.model.title : visual.title;
      const summary =
        visual.kind === "chart" ? visual.model.summary : visual.summary;
      const table =
        visual.kind === "chart" ? visual.model.table : visual.table;

      expect(title.length).toBeGreaterThan(10);
      expect(summary.length).toBeGreaterThan(40);
      // An unsubstituted placeholder in a summary is a broken sentence on a
      // live page; `fill` leaves the braces rather than writing "undefined".
      expect(summary).not.toMatch(/\{[a-z]+\}/i);
      expect(table.columns.length).toBeGreaterThanOrEqual(2);
      expect(table.rows.length).toBeGreaterThan(0);
    },
  );

  it("draws at least one quantity in every chart-shaped visual", () => {
    for (const article of EDUCATION_ARTICLES) {
      const visual = resolveEducationVisual(
        article.visual,
        EDUCATION_VISUAL_LABELS,
      );
      if (visual.kind !== "chart") continue;
      const model = visual.model;
      // Four model kinds, four different names for "the things drawn" —
      // `bars`, `columns`, `series` and `bands`. Naming them here is the
      // cheapest way to notice a fifth kind arriving.
      const drawn =
        model.kind === "bars"
          ? model.bars.length
          : model.kind === "columns"
            ? model.columns.length
            : model.kind === "areas"
              ? model.bands.length
              : model.series.length;
      expect(drawn, `${article.planId} draws nothing`).toBeGreaterThan(0);
    }
  });
});
