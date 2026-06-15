import { describe, it, expect } from "vitest";
import { pct, money, statusText, modeText } from "../format";

describe("mobile format", () => {
  it("pct", () => expect(pct(0.045)).toBe("4.50%"));
  it("money pos/neg", () => { expect(money(1000)).toContain("$1,000"); expect(money(-5)).toBe("-$5"); });
  it("statusText", () => { expect(statusText(true)).toBe("HALTED"); expect(statusText(false)).toBe("RUNNING"); });
  it("modeText", () => {
    expect(modeText("gate", true)).toBe("gate · dry-run");
    expect(modeText("driver", false)).toBe("driver · live");
    expect(modeText(undefined, undefined)).toBe("— · live");
  });
});
