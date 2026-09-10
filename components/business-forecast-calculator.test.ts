import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "business-forecast-calculator.tsx",
  ),
  "utf8",
);

describe("BusinessForecastCalculator — whole-number fields", () => {
  it("parses the base year as a count, not as money", () => {
    // parseMoney removes grouping dots, so a year typed as 2.026 would
    // become 2026 by accident while 2026 works. More importantly, using a
    // money grammar here violates the field contract and can silently accept
    // malformed years. Keep this source-level guard beside the component.
    expect(SOURCE).toContain(
      "const baseYear = parseCount(fields.values.baseYear);",
    );
    expect(SOURCE).not.toContain(
      "const baseYear = parseMoney(fields.values.baseYear);",
    );
  });
});
