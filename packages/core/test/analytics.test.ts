import { describe, it, expect } from "vitest";
import { sharpe, sortino, maxDrawdown, equityCurve, streaks, performanceReport } from "../src/analytics.js";

describe("sharpe", () => {
  it("positive for steadily positive returns", () => {
    expect(sharpe([0.01, 0.02, 0.01, 0.015])).toBeGreaterThan(0);
  });
  it("zero when sd is zero", () => expect(sharpe([0.01, 0.01, 0.01])).toBe(0));
  it("zero for single point", () => expect(sharpe([0.01])).toBe(0));
  it("throws on empty", () => expect(() => sharpe([])).toThrow(RangeError));
  it("throws on non-finite", () => expect(() => sharpe([0.1, NaN])).toThrow(RangeError));
});

describe("sortino", () => {
  it("positive with limited downside", () => {
    expect(sortino([0.02, -0.01, 0.03, -0.005])).toBeGreaterThan(0);
  });
  it("zero with no downside", () => expect(sortino([0.01, 0.02])).toBe(0));
});

describe("maxDrawdown + equityCurve", () => {
  it("computes drawdown from a curve", () => {
    expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo((120 - 90) / 120);
  });
  it("builds an equity curve", () => {
    const c = equityCurve(100, [0.1, -0.5]);
    expect(c[0]).toBe(100);
    expect(c[1]).toBeCloseTo(110);
    expect(c[2]).toBeCloseTo(55);
  });
  it("throws on empty curve", () => expect(() => maxDrawdown([])).toThrow(RangeError));
  it("throws on bad start", () => expect(() => equityCurve(0, [0.1])).toThrow(RangeError));
});

describe("streaks", () => {
  it("finds longest win and loss runs", () => {
    const s = streaks([0.1, 0.1, -0.1, -0.1, -0.1, 0, 0.1]);
    expect(s.longestWin).toBe(2);
    expect(s.longestLoss).toBe(3);
  });
});

describe("performanceReport", () => {
  it("assembles a full report", () => {
    const r = performanceReport([0.02, -0.01, 0.03, -0.005], 100);
    expect(r).toHaveProperty("totalReturn");
    expect(r).toHaveProperty("sharpe");
    expect(r.winRate).toBeCloseTo(0.5);
  });
  it("winRate 0 when all flat", () => {
    expect(performanceReport([0, 0]).winRate).toBe(0);
  });
});
