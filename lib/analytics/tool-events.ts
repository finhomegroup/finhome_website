import { CALCULATORS } from "@/content/calculators/registry";

/**
 * Prepared instrumentation boundary, NOT a connected analytics service.
 * No component calls this and no production sink is registered yet.
 * A future integration must verify consent, destination and event semantics.
 * The CTA opens web tools; app installs, handoffs and saved-plan completions
 * are not observable here. Never infer those outcomes from a click.
 */
export const TOOL_EVENTS = [
  "tool_view", "tool_input_started", "tool_result_viewed",
  "tool_scenario_changed", "tool_help_opened", "tool_next_step_clicked",
] as const;
export type ToolEventName = (typeof TOOL_EVENTS)[number];

export const ALLOWED_PAYLOAD_KEYS = [
  "tool_id", "chart_id", "variant", "position", "source",
] as const;
type PayloadKey = (typeof ALLOWED_PAYLOAD_KEYS)[number];
export type ToolEventPayload = Partial<Record<PayloadKey, string>>;

// Closed vocabularies, not digit-pattern heuristics: formatted amounts,
// emails and URLs can be short with no four-digit run. Adding an identifier
// requires a code change; arbitrary referrers/input values never pass.
const toolIds = CALCULATORS.map(({ slug }) => slug);
const allowedValues: Record<PayloadKey, ReadonlySet<string>> = {
  tool_id: new Set(toolIds),
  chart_id: new Set([
    "loan-columns", "loan-balance", "affordability-price",
    "affordability-monthly", "floating-timeline", "savings-curve",
    "compare-cost", "compare-payments",
  ]),
  variant: new Set([
    "household", "ceiling", "year", "month", "annuity", "flatPrincipal",
    "compact", "exact", "example", "user-input",
  ]),
  position: new Set([
    "hub", "inputs", "results", "chart", "chart-table", "details",
    "advanced", "explanation", "next-steps", "education",
  ]),
  // Articles use stable plan IDs, not titles, URL queries or user text.
  source: new Set([
    ...toolIds, "tools-hub", "education-collection",
    "C01", "C02", "C03", "C04", "C05", "C06",
    "C07", "C08", "C09", "C10", "C11", "C12",
  ]),
};
const eventNames: ReadonlySet<string> = new Set(TOOL_EVENTS);
const payloadKeys: ReadonlySet<string> = new Set(ALLOWED_PAYLOAD_KEYS);

export type PayloadProblem = {
  key: string;
  rule: "not-a-record" | "unknown-key" | "not-a-string" | "unknown-value" | "accessor";
};

/** Validate and copy once: the sink never receives the caller's object. */
function inspectPayload(payload: unknown): {
  problems: PayloadProblem[];
  value: ToolEventPayload;
} {
  const invalid = (): { problems: PayloadProblem[]; value: ToolEventPayload } => ({
    problems: [{ key: "", rule: "not-a-record" }], value: {},
  });
  try {
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return invalid();
    const prototype = Object.getPrototypeOf(payload);
    if (prototype !== Object.prototype && prototype !== null) return invalid();
    const descriptors = Object.getOwnPropertyDescriptors(payload);
    const problems: PayloadProblem[] = [];
    const value: ToolEventPayload = {};
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string" || !payloadKeys.has(key)) {
        problems.push({ key: typeof key === "string" ? key : "", rule: "unknown-key" });
        continue;
      }
      const descriptor = descriptors[key];
      if (!("value" in descriptor)) {
        problems.push({ key, rule: "accessor" });
      } else if (typeof descriptor.value !== "string") {
        problems.push({ key, rule: "not-a-string" });
      } else if (!allowedValues[key as PayloadKey].has(descriptor.value)) {
        problems.push({ key, rule: "unknown-value" });
      } else {
        value[key as PayloadKey] = descriptor.value;
      }
    }
    return { problems, value };
  } catch {
    // A malformed/proxied payload must not break the calculator.
    return invalid();
  }
}

export function payloadProblems(payload: unknown): PayloadProblem[] {
  return inspectPayload(payload).problems;
}
export function isSafePayload(payload: unknown): boolean {
  return payloadProblems(payload).length === 0;
}
export type ToolEventSink = (name: ToolEventName, payload: ToolEventPayload) => void;
let sink: ToolEventSink | null = null;

export function registerToolEventSink(next: ToolEventSink | null): void {
  sink = next;
}

/** No sink = no transmission. Runtime validation covers untyped callers too. */
export function trackToolEvent(name: ToolEventName, payload: ToolEventPayload = {}): void {
  if (sink === null || !eventNames.has(name)) return;
  const checked = inspectPayload(payload);
  if (checked.problems.length) return;
  try {
    sink(name, Object.freeze(checked.value));
  } catch {
    // Analytics failure must never break a calculator.
  }
}
