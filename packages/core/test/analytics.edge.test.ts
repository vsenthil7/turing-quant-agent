import { describe, it, expect } from "vitest";
import { sharpe, sortino, maxDrawdown, equityCurve, streaks, performanceReport } from "../src/analytics.js";

describe("analytics edge cases", () => {
  it("sharpe with all-negative returns is negative", () => {
    expect(sharpe([-0.01, -0.02, -0.015])).toBeLessThan(0);
  });
  it("sortino ignores upside vol", () => {
    const mixed = sortino([0.05, -0.01, 0.05, -0.01]);
    expect(mixed).toBeGreaterThan(0);
  });
  it("maxDrawdown of monotonic rising curve is 0", () => {
    expect(maxDrawdown([100, 110, 120, 130])).toBe(0);
  });
  it("maxDrawdown captures peak-to-trough", () => {
    expect(maxDrawdown([100, 200, 50])).toBeCloseTo(0.75);
  });
  it("equityCurve compounds correctly", () => {
    const c = equityCurve(100, [0.1, 0.1]);
    expect(c[2]).toBeCloseTo(121);
  });
  it("streaks handles alternating", () => {
    expect(streaks([0.1, -0.1, 0.1, -0.1])).toEqual({ longestWin: 1, longestLoss: 1 });
  });
  it("streaks all-wins", () => {
    expect(streaks([0.1, 0.2, 0.3]).longestWin).toBe(3);
  });
  it("performanceReport winRate excludes flats", () => {
    const r = performanceReport([0.1, 0, -0.1, 0.1]);
    expect(r.winRate).toBeCloseTo(2 / 3); // 2 wins of 3 non-flat
  });
});
