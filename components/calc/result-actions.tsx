import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import { nearAnswerSteps, nextStepsFor } from "@/content/calculators/next-steps";
import { NextStepCard } from "./next-step-card";
import { cn } from "@/lib/cn";

/**
 * One or two actions immediately after the primary answer.
 *
 * WHY IT EXISTS SEPARATELY FROM `ToolNextSteps`. P2 of the audit is "đưa 1–2
 * hành động phù hợp ngay sau câu trả lời, không chôn sau bảng dài", and the
 * third browser round measured the opposite on the floating-rate tool at
 * 390×844: the first next-step heading sat 1101,9 px below the bottom of the
 * authoritative answer, behind an 805,2 px plot. The fix is placement, not
 * deletion — this renders the first `NEAR_ANSWER_ACTIONS` destinations in the
 * `actions` slot between `primary` and `chart`, and `ToolNextSteps promoted`
 * keeps the rest, the education link and the retention paragraph below the
 * figure. No CSS reordering: source order is the reading order.
 *
 * IT IS NOT INSIDE THE LIVE REGION. `data-results-live` sits on an inner div of
 * `ResultGroup`; this is a sibling of that group, so a recalculation never
 * reads these links out. Keep it that way — an announcement that recites two
 * link labels after every keystroke is worse than no announcement.
 *
 * `actionsNote` is the one-line form of the no-transfer truth, placed where the
 * reader is about to leave. The full paragraph is still in the `saveBody` panel
 * below; this is the single clause that changes what they do.
 *
 * Renders nothing for a tool with no entry, which is the majority — a tip
 * calculator gets no home-buying funnel. A server component: links and text.
 */
export function ResultActions({
  slug,
  intro: introOverride,
  className,
}: {
  /** Registry slug of the tool the reader is on. */
  slug: string;
  /**
   * A mode-specific replacement for the entry's own `intro`.
   *
   * WHY. `next-steps.ts` holds ONE intro per slug, and a tool with two mutually
   * exclusive purposes has two different answers on screen. An independent
   * browser round caught both cases: the allocation study, which computes no
   * home-purchase allocation, was introducing its links with "hai câu hỏi tiếp
   * theo dùng chính con số phân bổ cho tiền mua nhà"; the fuel trip purpose,
   * which computes one trip, was introducing them with "chi phí đi lại mỗi
   * tháng". The DESTINATIONS are right in both modes — only the sentence that
   * frames them is wrong — so this overrides that sentence and nothing else.
   * The links, their labels, the note and the position are unchanged, and a
   * route that passes nothing keeps the entry's intro.
   */
  intro?: string;
  className?: string;
}) {
  const steps = nearAnswerSteps(slug);
  if (steps.length === 0) return null;
  const intro = introOverride ?? nextStepsFor(slug)?.intro;

  return (
    <section
      data-calc-actions="near-answer"
      className={cn("mt-6 rounded-2xl bg-bg-soft p-5", className)}
    >
      <h2 className="font-display text-base font-medium text-ink">
        {C.nextSteps.actionsTitle}
      </h2>
      {intro ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{intro}</p>
      ) : null}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <NextStepCard key={step.slug} step={step} from={slug} />
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        {C.nextSteps.actionsNote}
      </p>
    </section>
  );
}
