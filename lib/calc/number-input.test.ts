/**
 * Live formatting of a calculator input WHILE the reader types.
 *
 * The contract under test: a formatted string always parses to the same
 * figure as the raw string it came from (parity with `parseMoney` /
 * `parseDecimal`), an invalid string is passed through untouched rather than
 * being quietly turned into a valid one, and the caret lands where the reader
 * left it — including a Backspace or Delete pressed on a grouping dot, which
 * the browser has already removed by the time `onChange` fires.
 */
import { describe, expect, it } from "vitest";
import {
  formatMoneyInput,
  formatRateInput,
  reformatInput,
} from "@/lib/calc/number-input";
import { parseDecimal, parseMoney } from "@/lib/calc/number";

describe("formatMoneyInput", () => {
  it("groups thousands with dots as the digits arrive", () => {
    expect(formatMoneyInput("5")).toBe("5");
    expect(formatMoneyInput("500")).toBe("500");
    expect(formatMoneyInput("5000")).toBe("5.000");
    expect(formatMoneyInput("500000")).toBe("500.000");
    expect(formatMoneyInput("5000000")).toBe("5.000.000");
  });

  it("is idempotent on an already grouped figure, and regroups a misplaced dot", () => {
    expect(formatMoneyInput("500.000")).toBe("500.000");
    expect(formatMoneyInput("50.0000")).toBe("500.000");
    expect(formatMoneyInput("1.234.567,890")).toBe("1.234.567,890");
  });

  it("keeps a half-typed decimal mark and fractional trailing zeroes", () => {
    expect(formatMoneyInput("500000,")).toBe("500.000,");
    expect(formatMoneyInput("500000,5")).toBe("500.000,5");
    expect(formatMoneyInput("500000,50")).toBe("500.000,50");
    expect(formatMoneyInput(",5")).toBe(",5");
  });

  it("keeps the sign and the empty field", () => {
    expect(formatMoneyInput("")).toBe("");
    expect(formatMoneyInput("-")).toBe("-");
    expect(formatMoneyInput("-500000")).toBe("-500.000");
    expect(formatMoneyInput("-500000,25")).toBe("-500.000,25");
  });

  it("treats a typed dot as grouping, so the parser's reading is visible", () => {
    // `parseMoney("1.5")` is 15 (§4). The field shows 15 rather than letting
    // the reader believe they typed one and a half.
    expect(formatMoneyInput("1.")).toBe("1");
    expect(formatMoneyInput("1.5")).toBe("15");
  });

  it("passes an invalid string through untouched", () => {
    expect(formatMoneyInput("1,2,3")).toBe("1,2,3");
    expect(formatMoneyInput("12a")).toBe("12a");
    expect(formatMoneyInput("500 000")).toBe("500 000");
    expect(formatMoneyInput("--5")).toBe("--5");
    expect(formatMoneyInput("1,5.0")).toBe("1,5.0");
  });
});

describe("formatRateInput", () => {
  it("normalises the decimal mark to a comma", () => {
    expect(formatRateInput("7.5")).toBe("7,5");
    expect(formatRateInput("7,5")).toBe("7,5");
    expect(formatRateInput("-5.25")).toBe("-5,25");
  });

  it("keeps a half-typed decimal mark and fractional trailing zeroes", () => {
    expect(formatRateInput("7.")).toBe("7,");
    expect(formatRateInput("7,")).toBe("7,");
    expect(formatRateInput("7.50")).toBe("7,50");
    expect(formatRateInput(".5")).toBe(",5");
  });

  it("never groups a rate, and keeps the sign and the empty field", () => {
    expect(formatRateInput("1000")).toBe("1000");
    // `parseDecimal("1.000")` is 1 — the comma shows that reading.
    expect(formatRateInput("1.000")).toBe("1,000");
    expect(formatRateInput("")).toBe("");
    expect(formatRateInput("-")).toBe("-");
    expect(formatRateInput("7")).toBe("7");
  });

  it("passes an invalid string through untouched", () => {
    expect(formatRateInput("7.5.2")).toBe("7.5.2");
    expect(formatRateInput("7abc")).toBe("7abc");
    expect(formatRateInput("1e9")).toBe("1e9");
  });
});

describe("parser parity", () => {
  const MONEY_RAWS = [
    "",
    "-",
    "5",
    "500",
    "5000",
    "500000",
    "500.000",
    "50.0000",
    "500000,",
    "500000,5",
    "500000,50",
    "-500000",
    "-500000,25",
    ",5",
    "0",
    "0000",
    "1.",
    "1.5",
    "1.234.567,890",
    "1,2,3",
    "abc",
    "500 000",
    " 500",
    "--5",
    "1,5.0",
    ".",
    "..",
  ];

  const RATE_RAWS = [
    "",
    "-",
    "7",
    "7.5",
    "7,5",
    "7.",
    "7,",
    ".5",
    ",5",
    "-5",
    "-,5",
    "-.5",
    "7.50",
    "1000",
    "1.000",
    "100",
    "7.5.2",
    "abc",
    "1e9",
    " 7.5",
    ".",
  ];

  it("a formatted money string parses to the figure the raw one did, valid or not", () => {
    for (const raw of MONEY_RAWS) {
      expect(parseMoney(formatMoneyInput(raw)), raw).toBe(parseMoney(raw));
    }
  });

  it("a formatted rate string parses to the figure the raw one did, valid or not", () => {
    for (const raw of RATE_RAWS) {
      expect(parseDecimal(formatRateInput(raw)), raw).toBe(parseDecimal(raw));
    }
  });

  it("formatting is idempotent, so a stored value re-fed to the field does not move", () => {
    for (const raw of MONEY_RAWS) {
      const once = formatMoneyInput(raw);
      expect(formatMoneyInput(once), raw).toBe(once);
    }
    for (const raw of RATE_RAWS) {
      const once = formatRateInput(raw);
      expect(formatRateInput(once), raw).toBe(once);
    }
  });
});

describe("reformatInput — the caret", () => {
  it("does not delete a digit outside a selected grouping dot", () => {
    for (const inputType of ["deleteContentBackward", "deleteContentForward"]) {
      expect(reformatInput({
        previous: "1.234.000", raw: "1234.000", caret: 1,
        format: "money", inputType, hadSelection: true,
      })).toEqual({ value: "1.234.000", caret: 1 });
    }
  });

  it("does not widen deletion inside an invalid value", () => {
    expect(reformatInput({
      previous: "1.a", raw: "1a", caret: 1,
      format: "money", inputType: "deleteContentBackward",
    })).toEqual({ value: "1a", caret: 1 });
  });
  it("stays at the end while appending digits", () => {
    expect(
      reformatInput({ previous: "50.000", raw: "50.0000", caret: 7, format: "money" }),
    ).toEqual({ value: "500.000", caret: 7 });
  });

  it("follows the inserted digit when typing in the middle", () => {
    // "5|00.000" → type 1 → browser gives "51|00.000"
    expect(
      reformatInput({ previous: "500.000", raw: "5100.000", caret: 2, format: "money" }),
    ).toEqual({ value: "5.100.000", caret: 3 });
  });

  it("stays after the digit that survives an ordinary backspace", () => {
    // "1.234.0|00" → Backspace → "1.234.|00"
    expect(
      reformatInput({
        previous: "1.234.000",
        raw: "1.234.00",
        caret: 6,
        format: "money",
        inputType: "deleteContentBackward",
      }),
    ).toEqual({ value: "123.400", caret: 5 });
  });

  it("Backspace on a grouping dot deletes the digit before it instead of nothing", () => {
    // "1.234.|000" → Backspace removes the dot → "1.234|000"; the reader
    // meant the 4.
    expect(
      reformatInput({
        previous: "1.234.000",
        raw: "1.234000",
        caret: 5,
        format: "money",
        inputType: "deleteContentBackward",
      }),
    ).toEqual({ value: "123.000", caret: 3 });
  });

  it("Delete on a grouping dot deletes the digit after it instead of nothing", () => {
    // "1.234|.000" → Delete removes the dot → "1.234|000"; the reader meant
    // the first 0.
    expect(
      reformatInput({
        previous: "1.234.000",
        raw: "1.234000",
        caret: 5,
        format: "money",
        inputType: "deleteContentForward",
      }),
    ).toEqual({ value: "123.400", caret: 5 });
  });

  it("a selection deleted across a dot is formatted as it stands", () => {
    // "1.|234.|000" selected and deleted → "1.000"
    expect(
      reformatInput({
        previous: "1.234.000",
        raw: "1.000",
        caret: 2,
        format: "money",
        inputType: "deleteContentBackward",
      }),
    ).toEqual({ value: "1.000", caret: 2 });
  });

  it("keeps an invalid string and its caret untouched", () => {
    expect(
      reformatInput({ previous: "500.000", raw: "500.000a", caret: 8, format: "money" }),
    ).toEqual({ value: "500.000a", caret: 8 });
  });

  it("keeps the empty field and a lone sign", () => {
    expect(
      reformatInput({ previous: "5", raw: "", caret: 0, format: "money" }),
    ).toEqual({ value: "", caret: 0 });
    expect(
      reformatInput({ previous: "", raw: "-", caret: 1, format: "money" }),
    ).toEqual({ value: "-", caret: 1 });
  });

  it("swaps a rate's dot for a comma under the caret", () => {
    expect(
      reformatInput({ previous: "7", raw: "7.", caret: 2, format: "rate" }),
    ).toEqual({ value: "7,", caret: 2 });
    expect(
      reformatInput({ previous: "7,", raw: "7,5", caret: 3, format: "rate" }),
    ).toEqual({ value: "7,5", caret: 3 });
  });

  it("clamps a caret the browser reports past the end", () => {
    expect(
      reformatInput({ previous: "", raw: "5000", caret: 99, format: "money" }),
    ).toEqual({ value: "5.000", caret: 5 });
  });
});
