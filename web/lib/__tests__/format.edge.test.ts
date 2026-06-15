import { describe, it, expect } from "vitest";
import { pct, money, pnlClass } from "../format";

describe("format edge cases", () => {
  it("pct handles zero and negatives", () => {
    expect(pct(0)).toBe("0.00%");
    expect(pct(-0.05)).toBe("-5.00%");
  });
  it("pct handles large values", () => expect(pct(2.5)).toBe("250.00%"));
  it("money rounds to 2 decimals", () => expect(money(1234.567)).toContain("1,234.57"));
  it("money handles zero", () => expect(money(0)).toBe("$0"));
  it("money handles large numbers with separators", () => expect(money(1000000)).toContain("1,000,000"));
  it("pnlClass boundary at exactly zero", () => expect(pnlClass(0)).toBe("flat"));
  it("pnlClass tiny positive", () => expect(pnlClass(0.0001)).toBe("pos"));
  it("pnlClass tiny negative", () => expect(pnlClass(-0.0001)).toBe("neg"));
});
