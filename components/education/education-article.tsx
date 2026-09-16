import Link from "next/link";
import { AreaChart } from "@/components/calc/chart/area-chart";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { LineChart } from "@/components/calc/chart/line-chart";
import { ResultTable } from "@/components/calc/result-table";
import { ProseText } from "@/components/ui/prose-text";
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
 * article choice: question → short answer → declared hypothetical → body →
 * visual → exercise on the real tool → limits → sources → provenance. A reader
 * who stops after the visual has still been told what the numbers assume.
 */
export function EducationArticleBody({
  article,
}: {
  article: EducationArticle;
}) {
  const group = educationGroup(article.group);
  const visual = resolveEducationVisual(article.visual, EDUCATION_VISUAL_LABELS);
  const tool = getCalculator(article.exercise.toolSlug);
  if (!tool) {
    throw new Error(
      `components/education/education-article.tsx: "${article.slug}" points its exercise at "${article.exercise.toolSlug}", which is not in the registry.`,
    );
  }

  return (
    <div className="space-y-10">
      {/* The answer, before the explanation. */}
      <section>
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
      </section>

      {/* The hypothetical, declared as such BEFORE any figure is used. */}
      <section className="rounded-2xl bg-bg-soft p-5">
        <h2 className="font-display text-base font-medium text-ink">
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

      {article.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
        </section>
      ))}

      {/* HOW TO READ THE FIGURE, before the figure. The engine's own summary
          states the numbers; this states what the picture means and what it
          does not establish. A figure with no sentence of its own is a figure
          most readers scroll past. */}
      <section>
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
      <section className="rounded-2xl border border-ink-4/20 p-5">
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
          href={`${calculatorPath(article.exercise.toolSlug)}/`}
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

      <section>
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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

      <section>
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
          {C.article.groupNote} <strong className="font-medium">{group.name}</strong> — {group.boundary}
        </p>
      </section>

      {article.nextSlugs.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
            {C.article.nextTitle}
          </h2>
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
        </section>
      ) : null}
    </div>
  );
}
