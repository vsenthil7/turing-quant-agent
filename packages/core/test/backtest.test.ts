import { describe, it, expect } from "vitest";
import { backtest } from "../src/backtest.js";

describe("backtest", () => {
  it("runs deterministically and returns trades + return", () => {
    const closes = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 11, 12, 11, 10, 9];
    const r1 = backtest({ closes, fast: 2, slow: 4 });
    const r2 = backtest({ closes, fast: 2, slow: 4 });
    expect(r1).toEqual(r2); // deterministic
    expect(r1.trades).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(r1.finalReturn)).toBe(true);
  });
  it("registers at least one trade on a clear trend reversal", () => {
    const closes = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 11];
    const r = backtest({ closes, fast: 2, slow: 4 });
    expect(r.trades).toBeGreaterThan(0);
  });
  it("throws on insufficient data", () => {
    expect(() => backtest({ closes: [1, 2, 3], fast: 2, slow: 4 })).toThrow(RangeError);
  });
});
