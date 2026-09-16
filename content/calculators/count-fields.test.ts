import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parseCount, parseDecimal } from "@/lib/calc/number";
import { IRR_NPV } from "@/content/calculators/irr-npv";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";

/**
 * The whole-count fields on the investing shelf, and the unreachable guard.
 *
 * docs §4 picks the parser from the FIELD: a whole count — years, periods,
 * a scenario count — takes `parseCount`. Three rows on this shelf used
 * `parseDecimal` with a `Number.isInteger` guard underneath it, which is the
 * arrangement `parseCount`'s own docstring calls unreachable:
 * `parseDecimal("1.000")` is 1, and 1 IS an integer and IS inside every one
 * of these ranges, so the guard passed and the page computed a one-period
 * project, a one-year high-growth stage or a two-scenario distribution with
 * no field marked invalid and no error shown.
 *
 * The same arrangement was found and fixed on `thue-mua-xe` and two others
 * in the utilities unit. These are the investing shelf's three.
 *
 * WHY A SOURCE READ. The component owns the parse, and docs §6 records that
 * three of the suite's five worst defects lived in a component rather than
 * in a module — invisible to a green engine test. Nothing else in this repo
 * can see which parser a field went through.
 */

const COMPONENTS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../components",
);

/** The parser a component applies to one of its field keys. */
function parserFor(component: string, fieldKey: string): string | null {
  const source = readFileSync(`${COMPONENTS}/${component}`, "utf8");
  const match = new RegExp(
    `=\\s*(parse[A-Za-z]+)\\((?:\\w+\\.)*values(?:\\.${fieldKey}|\\["${fieldKey}"\\])`,
  ).exec(source);
  return match ? match[1] : null;
}

/** slug -> [component file, field key, the content default, the range]. */
const COUNT_FIELDS = [
  {
    slug: "irr-npv",
    component: "irr-npv-calculator.tsx",
    field: "periods",
    defaultValue: IRR_NPV.form.defaultPeriods,
    min: 1,
    max: 12,
    error: IRR_NPV.form.periodsInvalid,
  },
  {
    slug: "co-phieu-tang-truong-khong-deu",
    component: "ddm-multi-calculator.tsx",
    field: "years",
    defaultValue: DDM_MULTI.form.defaultYears,
    min: 1,
    max: 20,
    error: DDM_MULTI.form.yearsInvalid,
  },
  {
    slug: "loi-nhuan-ky-vong",
    component: "expected-return-calculator.tsx",
    field: "count",
    defaultValue: EXPECTED_RETURN.form.defaultCount,
    min: 2,
    max: 8,
    error: EXPECTED_RETURN.form.countInvalid,
  },
] as const;

describe("the unreachable integer guard", () => {
  it("is reachable only with parseCount — the grammar, not the range", () => {
    // VACUITY GUARD / REPRODUCTION. This is the defect itself, in two
    // lines: the value a reader types, and what each parser makes of it.
    expect(parseDecimal("1.000")).toBe(1);
    expect(Number.isInteger(parseDecimal("1.000"))).toBe(true);
    expect(parseCount("1.000")).toBeNull();
    // And `parseCount` still accepts what these fields are for, and still
    // rejects a decimal, so the range checks above it keep their meaning.
    for (const ok of ["1", "5", "12", "20"])
      expect(parseCount(ok)).toBe(Number(ok));
    expect(parseCount("3,5")).toBeNull();
    expect(parseCount("-4")).toBeNull();
  });

  it("routes every whole-count field on this shelf through parseCount", () => {
    for (const f of COUNT_FIELDS) {
      expect(
        parserFor(f.component, f.field),
        `${f.slug}: field "${f.field}" is a whole count in [${f.min}, ${f.max}] ` +
          `and its own error says so — docs §4 requires parseCount`,
      ).toBe("parseCount");
    }
  });

  it("parses each shipped default, and states its range in the error", () => {
    for (const f of COUNT_FIELDS) {
      const parsed = parseCount(f.defaultValue);
      expect(parsed, `${f.slug}: default "${f.defaultValue}"`).not.toBeNull();
      expect(parsed!).toBeGreaterThanOrEqual(f.min);
      expect(parsed!).toBeLessThanOrEqual(f.max);
      // The bound the engine enforces has to exist in the form — docs §7.
      // Substituted from the numbers, so a widened range that forgets the
      // copy is a failing test.
      expect(f.error, `${f.slug}: error text omits its own bounds`).toContain(
        String(f.max),
      );
    }
  });
});
