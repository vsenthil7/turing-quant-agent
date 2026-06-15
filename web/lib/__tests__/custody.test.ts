import { describe, it, expect } from "vitest";
import { validateAmount, equity } from "../custody";

const bal = { available: 100, locked: 20 };

describe("validateAmount", () => {
  it("accepts a valid deposit", () => expect(validateAmount("deposit", "50", bal, false)).toEqual({ valid: true }));
  it("rejects empty", () => expect(validateAmount("deposit", "", bal, false).valid).toBe(false));
  it("rejects non-numeric", () => expect(validateAmount("deposit", "abc", bal, false).valid).toBe(false));
  it("rejects zero / negative", () => {
    expect(validateAmount("deposit", "0", bal, false).valid).toBe(false);
    expect(validateAmount("deposit", "-5", bal, false).valid).toBe(false);
  });
  it("withdraw requires permission", () => {
    const r = validateAmount("withdraw", "10", bal, false);
    expect(r).toEqual({ valid: false, reason: "You lack withdraw permission" });
  });
  it("withdraw allowed with permission + funds", () => {
    expect(validateAmount("withdraw", "50", bal, true)).toEqual({ valid: true });
  });
  it("withdraw blocked over available", () => {
    expect(validateAmount("withdraw", "150", bal, true).reason).toBe("Insufficient available funds");
  });
  it("rejects non-finite (Infinity) amount", () => {
    expect(validateAmount("deposit", "Infinity", bal, false)).toEqual({ valid: false, reason: "Amount must be finite" });
  });
});

describe("equity", () => {
  it("sums available + locked", () => expect(equity(bal)).toBe(120));
});
