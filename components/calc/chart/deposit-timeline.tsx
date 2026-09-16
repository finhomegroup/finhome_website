import { formatDecimal } from "@/lib/calc/number";
import type { DepositTimelineModel } from "@/lib/calc/charts/deposit-chart";
import { cn } from "@/lib/cn";

/**
 * The deposit timeline: where the date the money is needed sits between the
 * deposit date and the relevant maturity.
 *
 * ORIGINAL ROW 20 asks for this beside the interest bars, and it answers a
 * different question — not "how much" but "is it there yet". A list of dates
 * in a table does not: the point is the ORDER and the gap.
 *
 * Built the same way as the other chart components: the model arrives fully
 * resolved (every date, day offset and position computed in
 * `deposit-chart.ts`, where a test can see it) and this draws it without
 * calculating anything.
 *
 * THE DRAWING IS DECORATION OVER A REAL LIST. The track and its markers are
 * `aria-hidden`, and under it every milestone appears as an ordered list item
 * with its label, its date and how many days after the deposit it falls — so
 * the figure reads identically with no CSS, no colour and a screen reader.
 * That also means a marker collision at some viewport width costs nothing:
 * the information is in the list.
 *
 * No animation, so there is no transition to suppress for reduced motion. No
 * `"use client"`: this renders on the server like the rest of the chart
 * layer, and it is not a calendar entry, a reminder or an appointment — the
 * model's own note says so on the page.
 */
export function DepositTimeline({
  model,
  className,
}: {
  model: DepositTimelineModel;
  className?: string;
}) {
  if (model.unavailable !== null) {
    return (
      <figure className={cn("mt-8", className)}>
        <figcaption className="font-display text-base font-medium text-ink">
          {model.title}
        </figcaption>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {model.unavailable}
        </p>
      </figure>
    );
  }

  return (
    <figure className={cn("mt-8", className)}>
      <figcaption className="font-display text-base font-medium text-ink">
        {model.title}
      </figcaption>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        {model.summary}
      </p>

      {/* The track. Decorative: the list below carries every figure. */}
      <div aria-hidden className="mt-6 px-2">
        <div className="relative h-2 rounded-full bg-ink-4/25">
          {model.milestones.map((milestone) => (
            <span
              key={milestone.key}
              style={{ left: `${milestone.at * 100}%` }}
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                milestone.emphasis
                  ? "size-4 bg-brand-green ring-2 ring-white"
                  : "size-3 bg-ink-3",
              )}
            />
          ))}
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {model.milestones.map((milestone) => (
          <li
            key={milestone.key}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink-4/15 pb-2 last:border-b-0"
          >
            <span
              className={cn(
                "text-sm leading-snug",
                milestone.emphasis ? "font-medium text-ink" : "text-ink-2",
              )}
            >
              {milestone.label}
            </span>
            <span className="text-sm tabular-nums text-ink">
              {formatDecimal(milestone.date.day, 0)}/
              {formatDecimal(milestone.date.month, 0)}/
              {formatDecimal(milestone.date.year, 0)}
              <span className="ml-2 text-ink-3">
                {milestone.dayOffsetLabel}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-sm leading-relaxed text-ink-3">{model.note}</p>
    </figure>
  );
}
