import { describe, it, expect } from "vitest";
import { backtest2 } from "../src/backtest2.js";
import { momentumStrategy } from "../src/strategies-extra.js";

const data = Array.from({ length: 80 }, (_, i) => 100 + 10 * Math.sin(i / 6) + i * 0.2);
const costs = { feeBps: 5, slippageBps: 10, fundingBpsPerPeriod: 1 };

describe("B5 backtest2", () => {
  it("is deterministic and returns a full report", () => {
    const params = { closes: data, strategy: momentumStrategy(), fast: 5, slow: 20, threshold: 0.1, notional: 1000, costs, warmup: 20 };
    const r1 = backtest2(params);
    const r2 = backtest2(params);
    expect(r1.report).toEqual(r2.report);
    expect(r1.report).toHaveProperty("sharpe");
    expect(r1.report).toHaveProperty("maxDrawdown");
    expect(r1.netReturns.length).toBeGreaterThan(0);
  });
  it("throws when warmup < slow", () => {
    expect(() => backtest2({ closes: data, strategy: momentumStrategy(), fast: 5, slow: 20, threshold: 0.1, notional: 1000, costs, warmup: 10 }))
      .toThrow("warmup must be >= slow");
  });
  it("throws on insufficient data", () => {
    expect(() => backtest2({ closes: data.slice(0, 21), strategy: momentumStrategy(), fast: 5, slow: 20, threshold: 0.1, notional: 1000, costs, warmup: 20 }))
      .toThrow("not enough data");
  });
});
