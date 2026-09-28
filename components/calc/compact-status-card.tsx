import { labelOf, toneOf, type StatusView } from "@/components/calc/result-status";
import { StatusIcon, TONE_INK, TONE_SURFACE } from "@/components/calc/status-tone";
import { cn } from "@/lib/cn";

/**
 * The semantic result card in its COMPACT form, for a first screen that also
 * has to hold a figure and a control: tone word + icon → conclusion → the one
 * figure → one small closing line. Its reasons and "what to try" live below
 * the controls, where their length cannot move them.
 *
 * The same presenters as `ResultStatusCard` — `TONE_INK`, `TONE_SURFACE`,
 * `StatusIcon`, `labelOf` — so a tone looks and reads the same on every card,
 * and every ink here is one `result-status-contrast.test.ts` already checks
 * on every tint (`ink-2`, not `ink-3`, for the small closing line). No live
 * region, no `role`, no focus: the page's ONE live region announces the
 * conclusion; this is read in order.
 */
export function CompactStatusCard({
  status,
  closing,
  className,
}: {
  status: StatusView;
  /** One or two short sentences: the limitation, which inputs are examples. */
  closing?: string | null;
  className?: string;
}) {
  const tone = toneOf(status);
  return (
    <section
      data-result-status={tone}
      className={cn("rounded-xl border px-4 py-3", TONE_SURFACE[tone], className)}
    >
      <p className={cn("flex items-center gap-1.5 text-sm font-medium", TONE_INK[tone])}>
        <StatusIcon tone={tone} />
        <span>{labelOf(status)}</span>
      </p>
      <p
        className={cn(
          "mt-1 font-display text-lg font-medium leading-snug",
          tone === "unknown" ? "text-ink" : TONE_INK[tone],
        )}
      >
        {status.title}
      </p>
      {status.fact ? (
        <p className="mt-0.5 text-base leading-snug text-ink">{status.fact}</p>
      ) : null}
      {closing ? (
        <p className="mt-2 text-xs leading-normal text-ink-2">{closing}</p>
      ) : null}
    </section>
  );
}
