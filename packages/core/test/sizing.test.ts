import { describe, it, expect } from "vitest";
import { positionSize, planExecution } from "../src/sizing.js";

describe("positionSize", () => {
  it("scales with confidence", () => {
    const lo = positionSize({ equity: 1000, score: 0.2, maxPositionSize: 1000, riskFraction: 0.5, volatility: 0 });
    const hi = positionSize({ equity: 1000, score: 0.9, maxPositionSize: 1000, riskFraction: 0.5, volatility: 0 });
    expect(hi).toBeGreaterThan(lo);
  });
  it("shrinks with volatility", () => {
    const calm = positionSize({ equity: 1000, score: 1, maxPositionSize: 1000, riskFraction: 0.5, volatility: 0 });
    const wild = positionSize({ equity: 1000, score: 1, maxPositionSize: 1000, riskFraction: 0.5, volatility: 0.5 });
    expect(wild).toBeLessThan(calm);
  });
  it("caps at maxPositionSize", () => {
    expect(positionSize({ equity: 1e9, score: 1, maxPositionSize: 100, riskFraction: 1, volatility: 0 })).toBe(100);
  });
  it("throws on bad equity", () => expect(() => positionSize({ equity: 0, score: 1, maxPositionSize: 1, riskFraction: 0.5, volatility: 0 })).toThrow(RangeError));
  it("throws on bad riskFraction", () => expect(() => positionSize({ equity: 1, score: 1, maxPositionSize: 1, riskFraction: 2, volatility: 0 })).toThrow(RangeError));
  it("throws on negative volatility", () => expect(() => positionSize({ equity: 1, score: 1, maxPositionSize: 1, riskFraction: 0.5, volatility: -1 })).toThrow(RangeError));
});

describe("planExecution", () => {
  it("single slice for small orders", () => {
    expect(planExecution(1, 1000).slices).toBe(1);
  });
  it("splits large orders", () => {
    expect(planExecution(500, 1000).slices).toBeGreaterThan(1);
  });
  it("estimates higher slippage for bigger impact", () => {
    const small = planExecution(10, 1000).estimatedSlippageBps;
    const big = planExecution(500, 1000).estimatedSlippageBps;
    expect(big).toBeGreaterThan(small);
  });
  it("throws on negative size", () => expect(() => planExecution(-1, 1000)).toThrow(RangeError));
  it("throws on non-positive liquidity", () => expect(() => planExecution(1, 0)).toThrow(RangeError));
});
