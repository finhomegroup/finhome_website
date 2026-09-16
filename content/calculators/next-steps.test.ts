import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOOL_NEXT_STEPS,
  nextStepsFor,
} from "@/content/calculators/next-steps";
import { getCalculator } from "@/content/calculators/registry";
import {
  TOOL_DISPOSITIONS,
  dispositionFor,
  dispositionsByPriority,
} from "@/content/calculators/plan-disposition";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { getEducationArticle } from "@/content/education/articles";
import { educationPosts } from "@/content/posts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

describe("contextual next steps", () => {
  it("points every step at a live calculator", () => {
    // A next step into a 404 is worse than no next step: it is a dead end the
    // reader reached because we told them to.
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      expect(getCalculator(from), `source tool "${from}"`).toBeDefined();
      for (const step of steps.tools) {
        const entry = getCalculator(step.slug);
        expect(entry, `${from} -> ${step.slug} is not in the registry`)
          .toBeDefined();
        expect(entry?.status, `${from} -> ${step.slug}`).toBe("live");
      }
    }
  });

  it("never sends a reader back to the tool they are already on", () => {
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      for (const step of steps.tools) {
        expect(step.slug, `${from} links to itself`).not.toBe(from);
      }
    }
  });

  it("never lists the same tool twice in one block", () => {
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      const slugs = steps.tools.map((t) => t.slug);
      expect(new Set(slugs).size, `${from} repeats a tool`).toBe(slugs.length);
    }
  });

  it("says what question each step answers, not what the tool is", () => {
    // `why` carries the reader's next question. A description of the tool
    // would duplicate its title and give no reason to click.
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      expect(steps.intro.trim().length, `${from} intro`).toBeGreaterThan(20);
      for (const step of steps.tools) {
        expect(
          step.why.trim().length,
          `${from} -> ${step.slug} why`,
        ).toBeGreaterThan(20);
        const title = getCalculator(step.slug)!.title;
        expect(
          step.why,
          `${from} -> ${step.slug} just restates the title`,
        ).not.toBe(title);
      }
    }
  });

  it("never tells a reader they got an answer they may not have", () => {
    // `ToolNextSteps` is a SERVER component beside the client calculator, so
    // it cannot know whether the form is valid. An intro reading "Bạn đã biết
    // khoản trả hằng tháng" congratulates a reader who is looking at a red
    // field and a row of dashes. Every intro is phrased conditionally instead,
    // which is true in both states.
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      for (const claim of [
        "Bạn đã",
        "bạn đã tính",
        "kết quả của bạn là",
        "đã tính xong",
      ]) {
        expect(steps.intro, `${from} intro claims "${claim}"`).not.toContain(
          claim,
        );
      }
    }
  });

  it("does NOT force a next step onto a library or utility tool", () => {
    // The failure this guards: a home-buying funnel under a tip calculator or
    // a United States payroll tool. A shelved tool must have no entry.
    for (const disposition of TOOL_DISPOSITIONS) {
      if (disposition.library === undefined) continue;
      expect(
        nextStepsFor(disposition.slug),
        `${disposition.slug} is shelved under "${disposition.library}" but has next steps`,
      ).toBeUndefined();
    }
  });

  it("covers every P1 tool, because those are the journeys", () => {
    for (const disposition of TOOL_DISPOSITIONS) {
      if (disposition.priority !== "P1") continue;
      expect(
        nextStepsFor(disposition.slug),
        `${disposition.slug} is P1 and needs next steps`,
      ).toBeDefined();
    }
  });

  it("leaves the other tools alone, so the block is genuinely contextual", () => {
    // The PROPERTY — far fewer than half the suite carries a next-steps block,
    // so the block stays contextual rather than becoming furniture.
    //
    // The comment here used to record "five of seventy-five have next steps
    // today". That was true when written and is now stale by twenty-six, which
    // matters more than a wrong number usually does: it advertised enormous
    // headroom to anyone about to add entries, while the real margin is small.
    // So the count is DERIVED into the failure message instead of narrated,
    // and the remaining margin is named — because the next agent to add a
    // next-step is the one who needs to know it.
    const withSteps = Object.keys(TOOL_NEXT_STEPS).length;
    const ceiling = TOOL_DISPOSITIONS.length / 2;
    expect(withSteps).toBeGreaterThanOrEqual(5);
    expect(
      withSteps,
      `${withSteps} of ${TOOL_DISPOSITIONS.length} tools carry next steps; ` +
        `the block stops being contextual past ${ceiling}, so there is room ` +
        `for about ${Math.floor(ceiling - withSteps)} more. If you need more ` +
        `than that, the question is whether this block is still contextual, ` +
        `not whether the ceiling should move.`,
    ).toBeLessThan(ceiling);
  });

  it("is actually RENDERED by every route that has an entry", () => {
    // An entry here is not a next step: `ToolNextSteps` is a slot the route
    // has to pass, and two routes with entries — `thu-nhap-dau-tu` and
    // `gia-tri-tien-te-theo-thoi-gian` — shipped without it, so the copy
    // existed and no reader ever saw a link. Source-text level, for the same
    // reason `live-region.test.ts` works that way: there is no jsdom here and
    // a route file is a server component that pulls in the whole shell.
    for (const slug of Object.keys(TOOL_NEXT_STEPS)) {
      const route = path.join(repoRoot, "app", "cong-cu", slug, "page.tsx");
      expect(existsSync(route), `${slug} has no route file`).toBe(true);
      expect(
        readFileSync(route, "utf8"),
        `${slug} has next steps that its page never renders`,
      ).toContain("ToolNextSteps");
    }
  });

  it("only sends a reader to a tool on or near the buying path", () => {
    // Every destination should itself be P1 or P2. A step into a P4 library
    // tool would be the same mistake in the other direction.
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      for (const step of steps.tools) {
        const priority = dispositionFor(step.slug)?.priority;
        expect(
          priority,
          `${from} -> ${step.slug} is ${priority}, off the buying path`,
        ).toMatch(/^P[12]$/);
      }
    }
  });
});

describe("the education seam", () => {
  it("points every link at a real article in the collection", () => {
    // Education articles are served by the dynamic `/blog/[slug]/` route, so
    // there is no per-article file on disk to check. The real contract is that
    // the slug exists in the collection AND in POSTS, which is what gives it a
    // route, a canonical URL and a sitemap entry.
    for (const [from, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      const education = steps.education;
      if (education === undefined) continue;
      const slug = education.href.replace(/^\/blog\//, "").replace(/\/$/, "");
      expect(
        getEducationArticle(slug),
        `${from} links to ${education.href}, which is not an article`,
      ).toBeDefined();
      expect(
        educationPosts().some((post) => post.slug === slug),
        `${from} links to ${education.href}, which is not in POSTS`,
      ).toBe(true);
      // Trailing slash, to match `trailingSlash: true`.
      expect(education.href.endsWith("/"), education.href).toBe(true);
    }
  });

  it("wires all five P1 tools, and links back both ways", () => {
    // The pair has to agree: the tool points at the article, and the article's
    // exercise points at the tool.
    for (const disposition of dispositionsByPriority("P1")) {
      const steps = nextStepsFor(disposition.slug);
      expect(steps?.education, `${disposition.slug} has no education link`)
        .toBeDefined();
      const slug = steps!.education!.href
        .replace(/^\/blog\//, "")
        .replace(/\/$/, "");
      const article = getEducationArticle(slug)!;
      expect(
        article.exercise.toolSlug,
        `${slug} does not point back at ${disposition.slug}`,
      ).toBe(disposition.slug);
    }
  });

  it("keeps the blog route file on disk, since every article needs it", () => {
    const route = path.join(repoRoot, "app", "blog", "[slug]", "page.tsx");
    expect(existsSync(route)).toBe(true);
    const index = path.join(
      repoRoot,
      "app",
      "blog",
      "mua-nha-bang-con-so",
      "page.tsx",
    );
    expect(existsSync(index)).toBe(true);
  });
});

describe("the saving copy, in place of a save button", () => {
  it("states that nothing is stored or sent", () => {
    // There is no verified app destination in this codebase and nothing on the
    // web saves a result. This copy is what stands in for the fake button, so
    // the two claims it must make are asserted rather than trusted.
    const body = TOOL_SHELL.nextSteps.saveBody;
    expect(body).toContain("không lưu");
    expect(body).toContain("không gửi");
  });

  it("promises no saved plan, no account and no app handoff", () => {
    const all = [
      TOOL_SHELL.nextSteps.saveTitle,
      TOOL_SHELL.nextSteps.saveBody,
      TOOL_SHELL.example.note,
      TOOL_SHELL.example.personalNote,
    ].join(" ");
    for (const phrase of [
      "Lưu kế hoạch",
      "đăng nhập",
      "tải app",
      "tải ứng dụng",
      "mở app",
    ]) {
      expect(
        all.toLowerCase().includes(phrase.toLowerCase()),
        `shell copy promises "${phrase}"`,
      ).toBe(false);
    }
  });

  it("gives the reader something they can actually do instead", () => {
    expect(TOOL_SHELL.nextSteps.saveBody).toContain("ghi lại");
  });
});
