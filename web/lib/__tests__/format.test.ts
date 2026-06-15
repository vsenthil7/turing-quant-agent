import { describe, it, expect } from "vitest";
import { pct, money, pnlClass } from "../format";

describe("format", () => {
  it("pct", () => expect(pct(0.1234)).toBe("12.34%"));
  it("money positive", () => expect(money(1234.5)).toContain("$1,234.5"));
  it("money negative", () => expect(money(-50)).toBe("-$50"));
  it("pnlClass", () => {
    expect(pnlClass(5)).toBe("pos");
    expect(pnlClass(-5)).toBe("neg");
    expect(pnlClass(0)).toBe("flat");
  });
});
