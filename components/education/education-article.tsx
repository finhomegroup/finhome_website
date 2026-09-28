import Link from "next/link";
import Image from "next/image";
import { AreaChart } from "@/components/calc/chart/area-chart";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { LineChart } from "@/components/calc/chart/line-chart";
import { ResultTable } from "@/components/calc/result-table";
import { ProseText } from "@/components/ui/prose-text";
import { ArrowRightIcon } from "@/components/education/icons";
import { chapterForGroup } from "@/content/education/chapters";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { educationGroup } from "@/content/education/groups";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import type { EducationArticle } from "@/content/education/types";
import { getEducationArticle } from "@/content/education/articles";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * One "Mua nhà bằng con số" article.
 *
 * A SERVER component, and every chart it renders is a shared component with no
 * `"use client"`, so an education page ships no chart JavaScript at all. The
 * visual is resolved on the server by running the production engine on the
 * hypothetical the article declares — the same engine the linked calculator
 * uses, so the figures cannot disagree.
 *
 * The section order is fixed by the collection's template and is not a per
 * article choice: question → short answer (with a link to the tool) → in-page
 * contents → declared hypothetical → body → visual → exercise on the real tool
 * → limits → sources → provenance → read next. A reader who stops after the
 * visual has still been told what the numbers assume.
 */
const ANCHOR_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";
export function EducationArticleBody({
  article,
}: {
  article: EducationArticle;
}) {
  const group = educationGroup(article.group);
  const resolved = resolveEducationVisual(article.visual, EDUCATION_VISUAL_LABELS);
  const visual = article.visualAssumptions
    ? resolved.kind === "chart"
      ? { ...resolved, model: { ...resolved.model, assumptions: [...article.visualAssumptions] } }
      : { ...resolved, assumptions: [...article.visualAssumptions] }
    : resolved;
  const tool = getCalculator(article.exercise.toolSlug);
  if (!tool) {
    throw new Error(
      `components/education/education-article.tsx: "${article.slug}" points its exercise at "${article.exercise.toolSlug}", which is not in the registry.`,
    );
  }

  const toolHref = `${calculatorPath(article.exercise.toolSlug)}/`;
  const chapter = chapterForGroup(article.group);
  const ids = sectionIds(article);
  const contents = [
    { id: ids.answer, label: C.article.answerTitle },
    { id: ids.household, label: article.household.title },
    ...article.sections.map((section, i) => ({ id: ids.sections[i], label: section.heading })),
    { id: ids.visual, label: C.article.visualReadingTitle },
    { id: ids.exercise, label: article.exercise.title },
    { id: ids.limits, label: article.limits.title },
    { id: ids.sources, label: article.sources.title },
  ];

  return (
    // Body text in the regular-width reading face; headings keep font-display.
    <div data-education-article className="space-y-10 font-reading tracking-normal">
      {/* The answer, before the explanation. */}
      <section aria-labelledby={ids.answer}>
        <h2 id={ids.answer} className="font-display text-xl font-medium text-ink md:text-2xl">
          {C.article.answerTitle}
        </h2>
        <div className="mt-3 space-y-3">
          {article.shortAnswer.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base leading-relaxed text-ink-2"
            >
              <ProseText
                text={paragraph}
                emphasis={article.shortAnswerEmphasis}
              />
            </p>
          ))}
        </div>

        {/* The tool, offered as soon as the reader knows the answer's shape.
            The full step-by-step exercise stays further down, after the
            example it depends on. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-ink-4/20 px-5 py-4">
          <p className="text-sm font-medium text-ink">{C.article.earlyToolLead}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={toolHref}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full bg-brand-green-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                FH_POINTER,
              )}
            >
              {C.article.openTool} {tool.title}
            </Link>
            <a
              href={`#${ids.exercise}`}
              className={cn(
                "inline-flex min-h-11 items-center text-sm font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2",
                FH_POINTER,
                ANCHOR_FOCUS,
              )}
            >
              {C.article.exerciseLink}
            </a>
          </div>
        </div>
      </section>

      {/* An illustration that opens the article's question, after the answer
          and the tool, before the contents. Labelled on the page; it holds no
          figure, and the computed visual further down is unchanged. A plain
          <img>: the static export has no image loader. Not lazy: it is near
          the top of the page. */}
      {article.illustration ? (
        <figure data-education-illustration="true" className="mx-auto w-full max-w-xl">
          <div className="relative">
            <img
              src={article.illustration.src}
              srcSet={article.illustration.srcSet}
              sizes="(min-width: 640px) 36rem, 100vw"
              width={article.illustration.width}
              height={article.illustration.height}
              alt={article.illustration.alt}
              decoding="async"
              className="block h-auto w-full rounded-xl border border-ink-4/15"
            />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-ink-2">
              {article.illustration.badge}
            </span>
          </div>
          <figcaption className="mt-3 text-sm leading-relaxed text-ink-3">
            {article.illustration.caption}
          </figcaption>
        </figure>
      ) : null}

      {/* In-page contents: ordinary anchors to the headings below. */}
      <ArticleContents id={ids.contents} items={contents} />

      {/* The hypothetical, declared as such BEFORE any figure is used. */}
      <section aria-labelledby={ids.household} className="rounded-2xl bg-bg-soft p-5">
        <h2 id={ids.household} className="font-display text-base font-medium text-ink">
          {article.household.title}
        </h2>
        <dl className="mt-3 space-y-1.5">
          {article.household.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-wrap justify-between gap-x-4 border-b border-ink-4/15 pb-1.5 last:border-b-0"
            >
              <dt className="text-sm text-ink-2">{item.label}</dt>
              <dd className="text-sm font-medium tabular-nums text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {article.household.note}
        </p>
      </section>

      {article.sections.map((section, index) => (
        <section key={section.heading} aria-labelledby={ids.sections[index]}>
          <h2 id={ids.sections[index]} className="font-display text-xl font-medium text-ink md:text-2xl">
            {section.heading}
          </h2>
          <div className="mt-3 space-y-3">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-relaxed text-ink-2"
              >
                <ProseText text={paragraph} emphasis={section.emphasis} />
              </p>
            ))}
          </div>
          {section.results ? (
            <div className="mt-5 rounded-xl bg-bg-soft p-4">
              <h3 className="font-medium text-ink">{section.results.caption}</h3>
              <dl className="mt-3 space-y-3">
                {section.results.rows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 border-b border-ink-4/15 pb-2 last:border-0 sm:flex-row sm:justify-between sm:gap-5">
                    <dt className="text-sm text-ink-2">{row.label}</dt>
                    <dd className="text-sm font-medium tabular-nums text-ink sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {section.media ? (
            <figure className="mt-5">
              <Image src={section.media.src} alt={section.media.alt} width={section.media.width} height={section.media.height} unoptimized className="h-auto w-full rounded-xl border border-ink-4/15" />
              <figcaption className="mt-3 text-sm leading-relaxed text-ink-3">{section.media.caption}</figcaption>
            </figure>
          ) : null}
        </section>
      ))}

      {/* HOW TO READ THE FIGURE, before the figure. The engine's own summary
          states the numbers; this states what the picture means and what it
          does not establish. A figure with no sentence of its own is a figure
          most readers scroll past. */}
      <section aria-labelledby={ids.visual}>
        <h2 id={ids.visual} className="font-display text-xl font-medium text-ink md:text-2xl">
          {C.article.visualReadingTitle}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-2">
          {article.visualReading}
        </p>
      </section>

      {/* The visual, computed by the engine from the hypothetical above. */}
      {visual.kind === "chart" ? (
        <ChartFigure model={visual.model} className="mt-0">
          {visual.model.kind === "bars" ? (
            <BarChart model={visual.model} />
          ) : visual.model.kind === "columns" ? (
            <ColumnChart model={visual.model} />
          ) : visual.model.kind === "areas" ? (
            <AreaChart model={visual.model} />
          ) : (
            <LineChart model={visual.model} />
          )}
        </ChartFigure>
      ) : (
        <figure>
          <figcaption className="font-display text-base font-medium text-ink">
            {visual.title}
          </figcaption>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {visual.summary}
          </p>
          {visual.unavailable === null ? (
            <ResultTable
              className="mt-4"
              caption={visual.table.caption}
              columns={[...visual.table.columns]}
              rows={visual.table.rows}
            />
          ) : null}
          {visual.assumptions.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-3">
                {C.article.assumptionsTitle}
              </h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {visual.assumptions.map((assumption) => (
                  <li
                    key={assumption}
                    className="text-sm leading-relaxed text-ink-3"
                  >
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </figure>
      )}

      {/* Do it with your own numbers, on the real tool. */}
      <section aria-labelledby={ids.exercise} className="rounded-2xl border border-ink-4/20 p-5">
        <h2 id={ids.exercise} className="font-display text-xl font-medium text-ink md:text-2xl">
          {article.exercise.title}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-ink-2">
          {article.exercise.intro}
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          {article.exercise.steps.map((step) => (
            <li key={step} className="text-sm leading-relaxed text-ink-2">
              {step}
            </li>
          ))}
        </ol>

        <Link
          href={toolHref}
          className={cn(
            "mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-green-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
            FH_POINTER,
          )}
        >
          {C.article.openTool} {tool.title}
        </Link>

        <div className="mt-4 space-y-2">
          <p className="text-sm leading-relaxed text-ink-2">
            <span className="font-medium text-ink">{C.article.changeLabel}</span>{" "}
            {article.exercise.change}
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            <span className="font-medium text-ink">{C.article.checkLabel}</span>{" "}
            {article.exercise.check}
          </p>
        </div>
      </section>

      <section aria-labelledby={ids.limits}>
        <h2 id={ids.limits} className="font-display text-xl font-medium text-ink md:text-2xl">
          {article.limits.title}
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          {article.limits.items.map((item) => (
            <li key={item} className="text-base leading-relaxed text-ink-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={ids.sources}>
        <h2 id={ids.sources} className="font-display text-xl font-medium text-ink md:text-2xl">
          {article.sources.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {article.sources.intro}
        </p>
        <ul className="mt-3 space-y-3">
          {article.sources.items.map((item) => (
            <li key={item.url} className="text-sm leading-relaxed text-ink-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
              >
                {item.label}
              </a>
              <span className="mt-1 block text-ink-3">{item.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Who wrote it and what has NOT been reviewed. No invented sign-off. */}
      <section className="rounded-2xl bg-bg-soft p-5">
        <h2 className="font-display text-base font-medium text-ink">
          {C.article.provenanceTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {article.provenance}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.article.groupNote} <strong className="font-medium">{group.name}</strong> — {group.description}
        </p>
      </section>

      {/* The one "read next" area on an education page: the curated links
          plus a way back to this article's chapter on the index. */}
      <section aria-labelledby={ids.next}>
        <h2 id={ids.next} className="font-display text-xl font-medium text-ink md:text-2xl">
          {C.article.nextTitle}
        </h2>
        <Link
          href={`${C.slug}/#${chapter.anchor}`}
          className={cn(
            "mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green-ink",
            FH_POINTER,
            ANCHOR_FOCUS,
          )}
        >
          {C.article.chapterLink} {chapter.number} · {chapter.label}
          <ArrowRightIcon className="size-4" />
        </Link>
        {article.nextSlugs.length > 0 ? (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {article.nextSlugs.map((slug) => {
              const next = getEducationArticle(slug);
              if (!next) {
                throw new Error(
                  `components/education/education-article.tsx: "${article.slug}" links to "${slug}", which is not an article in the collection.`,
                );
              }
              return (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}/`}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-4 transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                      FH_POINTER,
                    )}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-ink-3">
                      {educationGroup(next.group).name}
                    </span>
                    <span className="mt-1 text-sm leading-relaxed text-ink">
                      {next.question}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
      ) : null}
      </section>
    </div>
  );
}

/** ASCII anchor from a Vietnamese heading: "Giả định của ví dụ" → "gia-dinh-cua-vi-du". */
function anchorSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/**
 * The in-page contents, one `<nav>` landmark with two presentations of the
 * SAME ordered links, switched at `md` by `display`, so only one is ever
 * exposed to a reader or to assistive technology:
 *
 * - below `md`, a native `<details>`, CLOSED in the server markup: a phone
 *   sees one clear row — the title and "Xem N mục" — and opens it with no
 *   JavaScript. Nothing sets `open`, so there is no hydration to mismatch;
 * - from `md`, the same list, always shown under a heading. Nothing forces a
 *   closed `<details>` open with CSS.
 *
 * ONE COLUMN, numbered, full heading text: the old two-column grid read
 * left-to-right across unrelated rows. Each link is a full-width row at least
 * 44 px tall, divided from the next. The fixed header's offset is the global
 * `scroll-padding-top` on `html`, so the anchors need nothing of their own.
 * A server component: it ships no JavaScript.
 */
function ArticleContents({
  id,
  items,
}: {
  id: string;
  items: readonly { id: string; label: string }[];
}) {
  const title = C.article.contentsTitle;
  const list = (
    // `role="list"`: Safari drops list semantics from an unstyled list.
    <ol role="list" className="list-none divide-y divide-ink-4/25">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "flex min-h-11 w-full items-start gap-3 px-4 py-2.5 text-base leading-snug text-ink transition-colors hover:bg-bg-soft hover:text-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green md:px-5",
              FH_POINTER,
            )}
          >
            <span aria-hidden="true" className="w-5 shrink-0 pt-px text-right text-sm font-medium tabular-nums text-ink-3">
              {index + 1}
            </span>
            <span className="min-w-0">{item.label}</span>
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav
      id={id}
      aria-label={title}
      data-education-contents="true"
      className="overflow-hidden rounded-2xl border border-ink-4/30 bg-white"
    >
      <details data-contents="mobile" className="group md:hidden">
        <summary
          className={cn(
            "flex min-h-12 list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green [&::-webkit-details-marker]:hidden",
            FH_POINTER,
          )}
        >
          <span className="font-display text-base font-medium text-ink">{title}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-green-ink">
            <span className="group-open:hidden">
              {C.article.contentsShow.replace("{count}", String(items.length))}
            </span>
            <span className="hidden group-open:inline">{C.article.contentsHide}</span>
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 16 16"
              className="size-4 transition-transform group-open:rotate-180"
            >
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>
        <div className="border-t border-ink-4/25">{list}</div>
      </details>
      <div data-contents="desktop" className="hidden md:block">
        <h2 className="border-b border-ink-4/25 px-5 py-3 font-display text-base font-medium text-ink">
          {title}
        </h2>
        {list}
      </div>
    </nav>
  );
}

/**
 * Stable, unique ids for every heading the in-page contents links to. Fixed
 * sections get fixed ids; body sections derive theirs from the heading, with
 * a numeric suffix if two headings would collide.
 */
export function sectionIds(article: EducationArticle) {
  const fixed = {
    answer: "tra-loi-ngan",
    contents: "trong-bai-nay",
    household: "vi-du-gia-lap",
    visual: "doc-bieu-do",
    exercise: "bai-tap",
    limits: "gioi-han",
    sources: "nguon-tham-khao",
    next: "doc-tiep",
  };
  const taken = new Set<string>(Object.values(fixed));
  const sections = article.sections.map((section, index) => {
    const base = anchorSlug(section.heading) || `muc-${index + 1}`;
    let id = base;
    for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
    taken.add(id);
    return id;
  });
  return { ...fixed, sections };
}
