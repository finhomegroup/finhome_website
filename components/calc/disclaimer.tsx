import { cn } from "@/lib/cn";
import { CALCULATOR_COPY } from "@/content/calculators/shared";

/**
 * The notice every calculator carries.
 *
 * `default` goes below the results: the tool is illustrative, assumes a
 * constant user-supplied rate, excludes tax, fees and inflation, and is not
 * investment advice. Mandatory on every calculator — these pages put
 * financial figures in front of Vietnamese consumers.
 *
 * `us-rules` goes ABOVE the calculator and is styled to be noticed, for the
 * tools that model United States tax and retirement law. A Vietnamese user
 * should learn that a tool does not apply to them before they spend five
 * minutes filling it in, not afterwards.
 */
export function CalculatorDisclaimer({
  variant = "default",
  className,
}: {
  variant?: "default" | "us-rules";
  className?: string;
}) {
  const isUsRules = variant === "us-rules";

  return (
    <p
      className={cn(
        "rounded-xl border p-4 text-sm leading-relaxed",
        isUsRules
          ? "border-red-400/40 bg-red-50 text-ink-2"
          : "border-ink-4/15 bg-bg-soft text-ink-2",
        className,
      )}
    >
      {isUsRules ? CALCULATOR_COPY.usRulesNotice : CALCULATOR_COPY.disclaimer}
    </p>
  );
}
