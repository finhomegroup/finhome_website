import { cn } from "@/lib/cn";

/**
 * The region layout a calculator's inside is arranged with.
 *
 * WHAT IT IS FOR. The 2026-09-21 audit measured the form and the result still
 * stacked vertically at 1440×1000 on every one of the 76 routes, because
 * `CalculatorPage` holds the tool at `max-w-3xl` and each calculator is one
 * column inside that. A reader changing an input on a long tool could not see
 * the figure they were changing. The approved fix is a split at wide widths —
 * form on the left at about 40%, the primary answer and its chart on the right
 * at about 60% — with wide tables and detail panels full width underneath
 * rather than squeezed into either column.
 *
 * THE ONE PROPERTY THAT MAKES THIS SAFE: **the DOM order is the same at every
 * width.** The children are emitted as form → CTA → primary → actions → chart
 * → next steps → detail and nothing is reordered by CSS. That order is
 * simultaneously the required mobile sequence (inputs → CTA → primary result →
 * the one or two actions → chart → detail) and a sensible desktop reading
 * order, so tab order, screen-reader order and visual order agree at 390 px
 * and at 1440 px. A `grid` with `order` utilities could produce the same
 * picture and would decouple the three.
 *
 * `actions` sits BEFORE `chart` because the third browser round measured the
 * cost of the old order: on the floating-rate tool at 390×844 the first
 * next-step heading was 1101,9 px below the bottom of the primary answer,
 * behind an 805,2 px plot. Long guidance stays in `nextSteps` after the figure.
 *
 * `lg:grid-cols-5` with a 2/3 span is the 40/60 split, chosen over arbitrary
 * percentages so the gap comes out of the grid rather than out of the columns.
 * It starts at `lg` (1024 px): at 768 px two columns of this content are
 * narrower than the content needs, which is the "compact utilities stay
 * compact" half of the same rule.
 *
 * `lg:items-start` keeps each column its own height. Without it the form
 * stretches to the taller results column and its `fieldset` borders and
 * backgrounds grow with it.
 *
 * `min-w-0` on all three regions is load-bearing, not defensive. A grid item's
 * automatic minimum size is its content, so one wide `ResultTable` inside the
 * detail region would otherwise widen its track and push the whole tool past
 * the viewport — which is exactly the containment `ResultTable`'s own scroll
 * frame exists to provide and cannot provide from inside a grid that grew.
 *
 * NO STICKY CHROME, deliberately, and it is a decision rather than an omission.
 * The approved contract allows a short sticky summary and forbids pinning a
 * result column taller than the screen. A `position: sticky` primary panel
 * inside this column would be painted over its own chart as the chart scrolls
 * up under it — the panel has a background — so the cheap version of "sticky
 * summary" is worse than none. Whether a long form needs one is a browser
 * question about a measured viewport, not something to guess at here.
 *
 * A server component: it renders no state and takes composed nodes, so putting
 * a server-rendered `<ResultActions>` or `<LongTermViews>` into `actions`, or a
 * `<ToolNextSteps>` into `nextSteps`, ships no extra client JavaScript.
 */
export function CalculatorLayout({
  formId,
  columns = "split",
  form,
  cta,
  primary,
  learning,
  actions,
  chart,
  nextSteps,
  detail,
  className,
}: {
  /**
   * `id` for the form region, so `ResultCta` can scope its search for the
   * first invalid field to the inputs. Required: the CTA contract depends on
   * it and a missing id would silently widen that search to nothing.
   */
  formId: string;
  /**
   * `"split"` for a long tool — the 40/60 desktop split.
   *
   * `"single"` keeps one column at every width, for the utilities the audit
   * classed as "Gọn": a four-field percentage tool in two columns is two short
   * columns with a hole in the middle, and the CSV action for those rows says
   * the result belongs directly under the inputs.
   */
  columns?: "split" | "single";
  /** Every input, in its own groups. */
  form: React.ReactNode;
  /** `<ResultCta>`. Rendered inside the form region, after the last input. */
  cta?: React.ReactNode;
  /** ONE main answer plus two or three supporting figures. */
  primary: React.ReactNode;
  /**
   * OPT-IN, the 2026-09-29 living-infographic routes only (`lai-suat-tha-noi`,
   * `kha-nang-mua-nha`, the comparison
   * pair `so-sanh-khoan-vay` / `lai-co-dinh-hay-tha-noi`, and the savings pair
   * `muc-tieu-tiet-kiem` / `lai-kep`): the immediate learning response,
   * directly AFTER the answer and BEFORE `actions`. A browser pass at
   * 1440 × 1000 found the tall "Làm gì tiếp" block standing between the
   * answer and the approved visual; this puts the reader's control and the
   * figure it moves next to the answer. Plain DOM order at every width — no
   * CSS `order`, nothing sticky. A route that passes nothing keeps the
   * original form → CTA → primary → actions → chart → nextSteps order.
   *
   * `vay-mua-nha` and `vay-mua-xe` no longer use this slot: by the user's
   * later correction their visual comes FIRST, inside the result card, via
   * `ResultGroup`'s `visual` — see that component.
   */
  learning?: React.ReactNode;
  /**
   * ONE OR TWO COMPACT ACTIONS, immediately after the answer and before the
   * figure — P2 of the audit: "đưa 1–2 hành động phù hợp ngay sau câu trả lời,
   * không chôn sau bảng dài". `<ResultActions>`, or a tool's own short
   * navigation such as `<LongTermViews>`. Not a place for a prose block: the
   * point of the slot is that it is short enough to sit above the plot.
   */
  actions?: React.ReactNode;
  /** The figure, if the tool has one. Plan rows that say "no chart" pass none. */
  chart?: React.ReactNode;
  /**
   * The longer guidance after the figure: the further related questions, the
   * education link, the retention paragraph. `<ToolNextSteps promoted>`.
   */
  nextSteps?: React.ReactNode;
  /** Ledgers, schedules, wide tables, long caveats. Full width below. */
  detail?: React.ReactNode;
  className?: string;
}) {
  const split = columns === "split";

  return (
    <div
      className={cn(
        split && "lg:grid lg:grid-cols-5 lg:items-start lg:gap-8",
        className,
      )}
    >
      {/* The `data-calc-region` hooks are what the render tests assert on.
          They name the contract — three regions, in this order — without
          pinning any class, so the visual treatment can move without a test
          having an opinion about Tailwind. */}
      <div
        id={formId}
        data-calc-region="form"
        className={cn("min-w-0", split && "lg:col-span-2")}
      >
        {form}
        {cta}
      </div>

      <div
        data-calc-region="result"
        className={cn("mt-8 min-w-0", split && "lg:col-span-3 lg:mt-0")}
      >
        {primary}
        {learning}
        {actions}
        {chart}
        {nextSteps}
      </div>

      {detail ? (
        <div
          data-calc-region="detail"
          className={cn("mt-8 min-w-0", split && "lg:col-span-5")}
        >
          {detail}
        </div>
      ) : null}
    </div>
  );
}
