import { describe, it, expect } from "vitest";
import { CALCULATOR_HUB as C, HUB_JOURNEYS } from "@/content/calculators/hub";
import { getCalculator } from "@/content/calculators/registry";
import {
  TOOL_DISPOSITIONS,
  dispositionFor,
  dispositionsByPriority,
} from "@/content/calculators/plan-disposition";

describe("the hub's five question cards", () => {
  it("has one card per P1 tool, and no others", () => {
    // The cards ARE the P1 tier made visible. If the two lists could drift, a
    // tool could be promoted in the plan and never appear on the page, or a
    // card could keep pointing at a question the plan has moved on from.
    const cardSlugs = HUB_JOURNEYS.map((j) => j.slug);
    const p1Slugs = dispositionsByPriority("P1").map((d) => d.slug);
    expect([...cardSlugs].sort()).toEqual([...p1Slugs].sort());
  });

  it("points every card at a live registry entry", () => {
    for (const journey of HUB_JOURNEYS) {
      const entry = getCalculator(journey.slug);
      expect(entry, `no registry entry for "${journey.slug}"`).toBeDefined();
      expect(entry?.status, journey.slug).toBe("live");
    }
  });

  it("numbers the cards 1..5 with no gap or repeat", () => {
    expect(HUB_JOURNEYS.map((j) => j.step)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("asks a question and answers it without promising an approval", () => {
    // The audit's finding was that "giá nhà nên nhắm" reads as a figure a bank
    // has agreed to. These cards are the first thing a visitor reads, so the
    // words that would make that promise are banned here outright.
    const forbidden = ["được duyệt", "cam kết", "bảo đảm", "chắc chắn"];
    for (const journey of HUB_JOURNEYS) {
      expect(journey.question.trim().endsWith("?"), journey.slug).toBe(true);
      expect(journey.answer.trim().length, journey.slug).toBeGreaterThan(20);
      for (const phrase of forbidden) {
        expect(
          journey.answer.toLowerCase().includes(phrase),
          `${journey.slug} promises "${phrase}"`,
        ).toBe(false);
      }
    }
  });

  it("does not duplicate a tool across two cards", () => {
    const slugs = HUB_JOURNEYS.map((j) => j.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("the hub's catalogue copy", () => {
  it("keeps both count placeholders, so the number cannot be hardcoded", () => {
    // The count is substituted from the registry at render time. A copy edit
    // that dropped the placeholder would ship a sentence claiming a number the
    // page does not list — exactly the drift the old {live}/{total} legend
    // existed to prevent.
    expect(C.countAll).toContain("{total}");
    expect(C.countFiltered).toContain("{count}");
    expect(C.countFiltered).toContain("{total}");
  });

  it("does not leak our roadmap into consumer-facing copy", () => {
    // The browser check found "Đây là thứ tự chúng tôi đầu tư trước" on the
    // public directory. Which tools FinHome builds first is a fact about us;
    // the note has to help the visitor choose instead.
    const everyString = (value: unknown): string[] => {
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) return value.flatMap(everyString);
      if (value && typeof value === "object") {
        return Object.values(value).flatMap(everyString);
      }
      return [];
    };
    const copy = [...everyString(C), ...everyString(HUB_JOURNEYS)].join(" ");
    for (const phrase of [
      "chúng tôi đầu tư",
      "thứ tự đầu tư",
      "ưu tiên phát triển",
      "roadmap",
      "P1",
      "P2",
    ]) {
      expect(copy, `hub copy leaks "${phrase}"`).not.toContain(phrase);
    }
  });

  it("gives the visitor a way to choose, not a statement about us", () => {
    expect(C.journeysNote).toContain("Không cần đi theo thứ tự");
    // It names a concrete situation a reader can recognise themselves in.
    expect(C.journeysNote).toContain("báo giá");
  });

  it("keeps the tool count out of the page's headline", () => {
    // "Chuyển số lượng công cụ ra khỏi thông điệp chính" — the headline is a
    // question to the visitor, not a statistic about us.
    expect(C.pageTitle).not.toMatch(/\d/);
    expect(C.lede).not.toMatch(/\d+\s*công cụ/);
  });

  it("explains an empty result rather than just showing nothing", () => {
    expect(C.emptyTitle.trim().length).toBeGreaterThan(10);
    expect(C.emptyBody.trim().length).toBeGreaterThan(40);
    expect(C.emptyReset.trim().length).toBeGreaterThan(0);
  });

  it("labels and describes every library shelf the dispositions actually use", () => {
    // A shelf used in plan-disposition.ts with no label here renders an
    // `undefined` badge; with no description it renders a badge a screen
    // reader cannot explain.
    const used = new Set(
      TOOL_DISPOSITIONS.map((d) => d.library).filter(
        (l): l is NonNullable<typeof l> => l !== undefined,
      ),
    );
    expect(used.size).toBeGreaterThan(0);
    for (const library of used) {
      expect(C.libraryLabels[library], `label for "${library}"`).toBeTruthy();
      expect(
        C.libraryDescriptions[library],
        `description for "${library}"`,
      ).toBeTruthy();
    }
  });

  it("says plainly that a Hoa Kỳ tool does not apply to Vietnam", () => {
    // The badge is the only warning a visitor gets before clicking. docs and
    // the plan both call the unmarked United States tools a real risk for a
    // Vietnamese first-home buyer.
    expect(C.libraryDescriptions["hoa-ky"]).toContain("Hoa Kỳ");
    expect(C.libraryDescriptions["hoa-ky"]).toContain("Việt Nam");
  });

  it("gives the search box a label, a placeholder and usable help", () => {
    expect(C.searchLabel.trim().length).toBeGreaterThan(0);
    expect(C.searchPlaceholder.trim().length).toBeGreaterThan(0);
    // The diacritic-free hint is the difference between a searchable catalogue
    // and an unsearchable one for anyone without a Vietnamese input method.
    expect(C.searchHelp).toContain("dấu");
  });
});

describe("the hub's journey questions against the plan", () => {
  it("keeps each card's tool on the priority tier it claims", () => {
    for (const journey of HUB_JOURNEYS) {
      expect(dispositionFor(journey.slug)?.priority, journey.slug).toBe("P1");
    }
  });
});
