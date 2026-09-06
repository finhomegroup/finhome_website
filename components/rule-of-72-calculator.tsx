"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  parseRate,
  rule72Years,
  exactYears,
  formatYears,
} from "@/lib/rule-of-72";
import { RULE_OF_72 as C } from "@/content/rule-of-72";

function ResultRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-ink-4/20 py-3 first:border-t-0">
      <span className="text-sm leading-snug text-ink-2 md:text-base">
        {label}
      </span>
      <span className="shrink-0 font-display text-xl font-medium tabular-nums text-ink md:text-2xl">
        {value === null ? "—" : `${value} ${C.form.unit}`}
      </span>
    </div>
  );
}

export function RuleOf72Calculator() {
  const [raw, setRaw] = useState<string>(C.form.defaultRate);

  const rate = parseRate(raw);
  const estimate = rate === null ? null : rule72Years(rate);
  const exact = rate === null ? null : exactYears(rate);
  // A null estimate covers every rejected case: empty, unparseable, zero,
  // negative. `exact` is null under exactly the same conditions.
  const invalid = estimate === null;

  return (
    <div className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
      <label
        htmlFor="rule72-rate"
        className="block font-display text-base font-medium text-ink"
      >
        {C.form.rateLabel}
      </label>

      <div className="mt-3 flex items-center gap-3">
        <input
          id="rule72-rate"
          // Text, not number: `type="number"` rejects the comma decimal
          // separator Vietnamese keyboards produce. inputMode gives mobile the
          // numeric keypad anyway.
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          aria-describedby="rule72-rate-help"
          aria-invalid={invalid}
          className={cn(
            "w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
            "placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
            invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        <span aria-hidden className="text-base text-ink-2">
          {C.form.rateSuffix}
        </span>
      </div>

      <p
        id="rule72-rate-help"
        aria-live="polite"
        className={cn(
          "mt-2 text-sm leading-relaxed",
          invalid ? "text-red-600" : "text-ink-3",
        )}
      >
        {invalid ? C.form.rateInvalid : C.form.rateHelp}
      </p>

      <div className="mt-6 rounded-2xl bg-bg-soft p-5">
        <h2 className="font-display text-base font-medium text-ink">
          {C.form.resultTitle}
        </h2>
        {/* One live region wrapping both rows: screen readers announce the
            recomputed results, not every keystroke in the input. */}
        <div className="mt-2" aria-live="polite">
          <ResultRow
            label={C.form.estimateLabel}
            value={estimate === null ? null : formatYears(estimate)}
          />
          <ResultRow
            label={C.form.exactLabel}
            value={exact === null ? null : formatYears(exact)}
          />
        </div>
      </div>
    </div>
  );
}
