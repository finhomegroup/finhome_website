import { describe, it, expect, afterEach } from "vitest";
import {
  ALLOWED_PAYLOAD_KEYS,
  TOOL_EVENTS,
  isSafePayload,
  payloadProblems,
  registerToolEventSink,
  trackToolEvent,
  type ToolEventName,
  type ToolEventPayload,
} from "@/lib/analytics/tool-events";

afterEach(() => {
  registerToolEventSink(null);
});

describe("the event vocabulary", () => {
  it("has no event claiming an outcome this website cannot observe", () => {
    // The measurement error the audit named: a click on a CTA reported as a
    // completed handoff, an install, or a saved plan. None of the three is
    // observable from a static web page, so none of them may exist here.
    const forbidden = [
      "app_handoff_completed",
      "plan_saved",
      "install_completed",
      "app_installed",
      "activation",
      "conversion",
    ];
    for (const name of forbidden) {
      expect(
        (TOOL_EVENTS as readonly string[]).includes(name),
        `"${name}" must not be an event this site can fire`,
      ).toBe(false);
    }
  });

  it("names events after what the user did", () => {
    expect(TOOL_EVENTS).toContain("tool_view");
    expect(TOOL_EVENTS).toContain("tool_input_started");
    expect(TOOL_EVENTS).toContain("tool_result_viewed");
    expect(TOOL_EVENTS).toContain("tool_scenario_changed");
  });

  it("has no duplicate event name", () => {
    expect(new Set(TOOL_EVENTS).size).toBe(TOOL_EVENTS.length);
  });
});

describe("the payload allowlist", () => {
  it("has no key that could hold an amount, a rate or a term", () => {
    // Asserted on the allowlist itself rather than only on values: a key named
    // `amount` would make every other guard here irrelevant.
    const banned = [
      "amount",
      "income",
      "salary",
      "debt",
      "balance",
      "rate",
      "term",
      "price",
      "loan",
      "payment",
      "notes",
      "value",
      "query",
    ];
    for (const key of banned) {
      expect(
        (ALLOWED_PAYLOAD_KEYS as readonly string[]).includes(key),
        `"${key}" must not be an allowed payload key`,
      ).toBe(false);
    }
  });

  it("accepts the identifiers a funnel actually needs", () => {
    expect(
      isSafePayload({
        tool_id: "vay-mua-nha",
        chart_id: "loan-columns",
        variant: "household",
        position: "next-steps",
        source: "kha-nang-mua-nha",
      } satisfies ToolEventPayload),
    ).toBe(true);
  });

  it("accepts an empty payload", () => {
    expect(isSafePayload({})).toBe(true);
  });
});

describe("payloadProblems", () => {
  it("rejects a key that is not on the allowlist, and says so", () => {
    expect(payloadProblems({ monthly_income: "50000000" })).toEqual([
      { key: "monthly_income", rule: "unknown-key" },
    ]);
  });

  it("rejects an amount smuggled through an allowed key", () => {
    // Only known identifiers may pass, regardless of numeric formatting.
    expect(payloadProblems({ variant: "2000000000" })).toEqual([
      { key: "variant", rule: "unknown-value" },
    ]);
    expect(payloadProblems({ position: "thu-nhap-50000000" })).toEqual([
      { key: "position", rule: "unknown-value" },
    ]);
  });

  it("still accepts the slugs that legitimately contain digits", () => {
    // "quy-tac-72", "gop-401k" and "toi-da-401k" are real routes. A guard
    // that rejected them would be a guard the next developer disables.
    for (const slug of ["quy-tac-72", "gop-401k", "toi-da-401k", "apr"]) {
      expect(payloadProblems({ tool_id: slug }), slug).toEqual([]);
    }
  });

  it("rejects a non-string value", () => {
    expect(payloadProblems({ tool_id: 42 })).toEqual([
      { key: "tool_id", rule: "not-a-string" },
    ]);
    expect(payloadProblems({ tool_id: null })).toEqual([
      { key: "tool_id", rule: "not-a-string" },
    ]);
  });

  it("rejects a value long enough to be prose", () => {
    expect(payloadProblems({ variant: "x".repeat(49) })).toEqual([
      { key: "variant", rule: "unknown-value" },
    ]);
    expect(payloadProblems({ variant: "x".repeat(48) })).toEqual([
      { key: "variant", rule: "unknown-value" },
    ]);
  });

  it("reports every problem, not just the first", () => {
    const problems = payloadProblems({
      monthly_income: "1",
      variant: "50000000",
    });
    expect(problems).toHaveLength(2);
    expect(problems.map((p) => p.rule).sort()).toEqual([
      "unknown-key",
      "unknown-value",
    ]);
  });

  it("rejects something that is not an object at all", () => {
    expect(payloadProblems(null).length).toBeGreaterThan(0);
    expect(payloadProblems("tool_id=1").length).toBeGreaterThan(0);
    expect(payloadProblems(undefined).length).toBeGreaterThan(0);
  });
});

describe("trackToolEvent", () => {
  it.each([
    ["source", "2.000.000.000"],
    ["variant", "8,5"],
    ["position", "person@example.com"],
    ["source", "/cong-cu/?income=50m"],
    ["tool_id", "unknown-tool"],
    ["source", "C13"],
    ["chart_id", "unknown-chart"],
    ["variant", "42"],
  ])("drops arbitrary data in %s (%s)", (key, value) => {
    const seen: unknown[] = [];
    registerToolEventSink((name, payload) => seen.push([name, payload]));
    trackToolEvent("tool_view", { [key]: value });
    expect(seen).toEqual([]);
  });

  it("accepts only known article IDs and known event names at runtime", () => {
    const seen: unknown[] = [];
    registerToolEventSink((name, payload) => seen.push([name, payload]));
    trackToolEvent("tool_view", { tool_id: "apr", source: "C12" });
    // @ts-expect-error Runtime callers need the same boundary as typed callers.
    trackToolEvent("income-50m", { tool_id: "apr" });
    expect(seen).toEqual([["tool_view", { tool_id: "apr", source: "C12" }]]);
  });

  it("rejects arrays, inherited records, hidden keys and accessors without evaluating them", () => {
    let reads = 0;
    const accessor = { get source() { reads++; return "C01"; } };
    const hidden = Object.defineProperty({ tool_id: "apr" }, "income", { value: "50m" });
    for (const value of [[], ["apr"], Object.create({ tool_id: "apr" }), hidden, accessor, { [Symbol("income")]: "50m" }]) {
      expect(isSafePayload(value)).toBe(false);
    }
    expect(reads).toBe(0);
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    expect(() => isSafePayload(revoked.proxy)).not.toThrow();
    expect(isSafePayload(revoked.proxy)).toBe(false);
  });

  it("passes a validated snapshot, not a mutable caller record", () => {
    const caller: ToolEventPayload = { tool_id: "apr" };
    let received: ToolEventPayload | undefined;
    registerToolEventSink((_name, payload) => { received = payload; });
    trackToolEvent("tool_view", caller);
    caller.tool_id = "person@example.com";
    expect(received).toEqual({ tool_id: "apr" });
    expect(Object.isFrozen(received)).toBe(true);
  });

  it("does nothing at all when no sink is registered", () => {
    // The prepared seam has no production callers and sends nowhere.
    expect(() => trackToolEvent("tool_view", { tool_id: "vay-mua-nha" })).not.toThrow();
  });

  it("hands a safe event to a registered sink", () => {
    const seen: [ToolEventName, ToolEventPayload][] = [];
    registerToolEventSink((name, payload) => seen.push([name, payload]));
    trackToolEvent("tool_view", { tool_id: "vay-mua-nha" });
    expect(seen).toEqual([["tool_view", { tool_id: "vay-mua-nha" }]]);
  });

  it("DROPS an unsafe payload rather than sending it", () => {
    // The guard has to be unbypassable. A caller who did not read the
    // docstring must not be able to leak an income into a vendor.
    const seen: unknown[] = [];
    registerToolEventSink((name, payload) => seen.push([name, payload]));
    // @ts-expect-error — deliberately the mistake this guard exists for.
    trackToolEvent("tool_view", { monthly_income: "50000000" });
    // @ts-expect-error — and an amount through an allowed key.
    trackToolEvent("tool_view", { variant: 2_000_000_000 });
    expect(seen).toEqual([]);
  });

  it("survives a sink that throws", () => {
    // An analytics failure must never break a calculator.
    registerToolEventSink(() => {
      throw new Error("vendor down");
    });
    expect(() => trackToolEvent("tool_view", { tool_id: "apr" })).not.toThrow();
  });

  it("stops sending once the sink is removed", () => {
    const seen: unknown[] = [];
    registerToolEventSink(() => seen.push(1));
    trackToolEvent("tool_view");
    registerToolEventSink(null);
    trackToolEvent("tool_view");
    expect(seen).toHaveLength(1);
  });
});
