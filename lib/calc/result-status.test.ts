import { describe, expect, it } from "vitest";
import { LEDGER_RESIDUE_DONG } from "@/lib/calc/charts/bars";
import {
  atLedgerZero,
  RESULT_TONES,
  type ResultTone,
} from "@/lib/calc/result-status";

describe("the shared result-status vocabulary", () => {
  it("has exactly four tones, named for meaning rather than colour", () => {
    // A tone is a MEANING — shortfall, met, caution, unknown — never "red" or
    // "green", so a presenter cannot map a sign to a colour by accident.
    const tones: readonly ResultTone[] = RESULT_TONES;
    expect([...tones]).toEqual(["shortfall", "met", "caution", "unknown"]);
  });

  it("treats only sub-half-đồng residue as an exact zero", () => {
    // The ONE tolerance in this layer is the ledger's existing half đồng, not
    // a new threshold: a one-đồng surplus is a surplus.
    expect(atLedgerZero(0)).toBe(true);
    expect(atLedgerZero(LEDGER_RESIDUE_DONG / 2)).toBe(true);
    expect(atLedgerZero(-LEDGER_RESIDUE_DONG / 2)).toBe(true);
    expect(atLedgerZero(LEDGER_RESIDUE_DONG)).toBe(false);
    expect(atLedgerZero(1)).toBe(false);
    expect(atLedgerZero(-1)).toBe(false);
    expect(atLedgerZero(Number.NaN)).toBe(false);
  });
});
