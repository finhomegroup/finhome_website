"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { CALCULATOR_HUB as C } from "@/content/calculators/hub";
import { filterTools, type SearchableTool } from "@/lib/calc/tool-search";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * One row of the complete catalogue.
 *
 * Everything the client needs is passed in as plain serializable data from the
 * server component — the registry and the plan disposition are never imported
 * across the boundary, so none of that lands in the client bundle twice.
 */
export type CatalogTool = SearchableTool & {
  /** Ordering key; the hub supplies the labels. */
  category: string;
  /** Shown at the end of the row when the tool is shelved. */
  libraryLabel?: string;
  /** The accessible explanation behind that badge. */
  libraryDescription?: string;
  /** A registry entry that is listed but not built yet. */
  planned: boolean;
};

/**
 * The searchable index of every tool.
 *
 * A client island, and the only interactive part of the hub. The question
 * cards above it are server-rendered, so the page's primary way in works
 * before hydration and without JavaScript — the audit's F01 contract ("question
 * cards and complete catalog are visible without animation prerequisite").
 *
 * With an empty query `filterTools` returns the list unchanged, so the first
 * client render is byte-identical to the prerendered HTML and hydration is
 * clean. The same is true of the clear button, which only exists once the user
 * has typed something.
 *
 * The result count sits in a `role="status"` region rather than being left
 * silent: a sighted user sees the list shrink, and without this a screen-reader
 * user gets no signal at all that typing did anything. It is one short
 * sentence by design — the list itself is NOT live, for the same reason docs §4
 * keeps a table out of a live region.
 */
export function ToolCatalog({
  tools,
  categoryOrder,
  questions,
  catalogIntro,
}: {
  tools: CatalogTool[];
  /** Category keys in display order, with their labels. */
  categoryOrder: { category: string; label: string }[];
  /**
   * The five first-home-buyer question cards, rendered ON THE SERVER and passed
   * through as children — so they stay server HTML even though their parent is
   * a client island, and the F01 contract above still holds.
   *
   * THEY SIT BELOW THE SEARCH BOX, AND THEY DISAPPEAR WHILE SEARCHING. The
   * search box used to live down here with the list, which put it 1.022 px
   * below the fold at a measured 390 px viewport and 258 px below it at
   * 1280×900 — a page whose headline asks "Bạn đang muốn biết điều gì?" while
   * the box for answering it was off-screen, behind five cards.
   *
   * Moving only the box would have been worse than leaving it: typing at the
   * top would filter a list a thousand pixels further down, with nothing
   * visibly happening. So the cards unmount as soon as there is a query, which
   * brings the results up directly beneath the input. With an empty query
   * nothing is hidden, so the first client render still matches the prerendered
   * HTML and hydration stays clean.
   */
  questions?: React.ReactNode;
  /** The catalogue's own heading and ledes, shown above the list. */
  catalogIntro?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const id = useId();
  const searchId = `${id}-search`;
  const helpId = `${id}-help`;
  const listId = `${id}-list`;

  const visible = useMemo(() => filterTools(tools, query), [tools, query]);

  const groups = categoryOrder
    .map(({ category, label }) => ({
      category,
      label,
      items: visible.filter((tool) => tool.category === category),
    }))
    .filter((group) => group.items.length > 0);

  const searching = query.trim().length > 0;
  const countText = (
    searching ? C.countFiltered : C.countAll
  )
    .replace("{count}", String(visible.length))
    .replace("{total}", String(tools.length));

  return (
    <div>
      <div className="mx-auto max-w-xl">
        <label
          htmlFor={searchId}
          className="block font-display text-base font-medium text-ink"
        >
          {C.searchLabel}
        </label>
        <div className="mt-3 flex items-center gap-3">
          <input
            id={searchId}
            // type="search" gives mobile keyboards a search action and the
            // platform's own clear affordance; the explicit button below is
            // for the platforms that render neither.
            type="search"
            autoComplete="off"
            value={query}
            placeholder={C.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={helpId}
            aria-controls={listId}
            className="w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
          />
          {searching ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border border-ink-4/35 bg-white px-4 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                FH_POINTER,
              )}
            >
              {C.clearSearchLabel}
            </button>
          ) : null}
        </div>
        <p id={helpId} className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.searchHelp}
        </p>
        <p role="status" className="mt-2 text-sm leading-relaxed text-ink-2">
          {countText}
        </p>
      </div>

      {/*
        Unmounted rather than hidden with a class, so a searching reader's
        screen reader and keyboard order match what is on screen. The cards are
        the page's no-JavaScript entry point, and `searching` is false on the
        first render, so they are present in the prerendered HTML either way.
      */}
      {searching ? null : questions}

      {catalogIntro}

      <div id={listId}>
        {groups.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-bg-soft p-5 text-center">
            <p className="font-display text-base font-medium text-ink">
              {C.emptyTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {C.emptyBody}
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className={cn(
                "mt-4 inline-flex min-h-11 items-center rounded-full border border-ink-4/35 bg-white px-5 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                FH_POINTER,
              )}
            >
              {C.emptyReset}
            </button>
          </div>
        ) : (
          /*
            A dense multi-column index rather than seventy-five summary cards,
            which would be a ~7,000px scroll you cannot see the shape of. The
            summary still appears on each tool's own page.

            `columns` rather than a grid: category blocks have very different
            heights (16 tools vs 2), and CSS columns flow them without leaving
            the ragged gaps a grid row would. Single column on mobile.
          */
          <div className="mt-10 gap-x-10 md:columns-2 xl:columns-3">
            {groups.map((group) => (
              <section
                key={group.category}
                // Keeps a heading from being orphaned at the foot of a column.
                className="mb-8 break-inside-avoid"
              >
                <h3 className="flex items-baseline gap-2 border-b border-ink-4/25 pb-2 font-display text-base font-medium text-ink">
                  {group.label}
                  <span className="text-sm font-normal text-ink-3">
                    {group.items.length}
                  </span>
                </h3>

                <ul className="mt-2">
                  {group.items.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/cong-cu/${tool.slug}/`}
                        aria-label={
                          tool.libraryLabel
                            ? `${tool.title} — ${tool.libraryDescription ?? tool.libraryLabel}`
                            : tool.title
                        }
                        className={cn(
                          "flex min-h-11 items-baseline gap-2 rounded-md px-1.5 py-1.5 text-sm leading-snug transition-colors md:min-h-0 md:py-1",
                          tool.planned
                            ? "text-ink-3 hover:bg-bg-soft hover:text-ink-2"
                            : "text-ink hover:bg-bg-soft hover:text-brand-green",
                          FH_POINTER,
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            tool.planned ? "bg-ink-4/60" : "bg-brand-green",
                          )}
                        />
                        <span className="min-w-0 flex-1">{tool.title}</span>
                        {tool.libraryLabel ? (
                          // aria-hidden: the accessible name on the link above
                          // already carries the full explanation, so the badge
                          // would otherwise be announced twice and abbreviated.
                          <span
                            aria-hidden
                            className="shrink-0 rounded-full border border-ink-4/30 px-2 py-0.5 text-xs font-normal text-ink-3"
                          >
                            {tool.libraryLabel}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
