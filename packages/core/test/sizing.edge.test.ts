import { describe, it, expect } from "vitest";
import { positionSize, planExecution } from "../src/sizing.js";

describe("sizing edge cases", () => {
  it("zero score => zero size", () => {
    expect(positionSize({ equity: 1000, score: 0, maxPositionSize: 1000, riskFraction: 0.5, volatility: 0 })).toBe(0);
  });
  it("full confidence uses full risk fraction (no vol)", () => {
    expect(positionSize({ equity: 1000, score: 1, maxPositionSize: 10000, riskFraction: 0.5, volatility: 0 })).toBeCloseTo(500);
  });
  it("extreme vol shrinks size toward zero", () => {
    const s = positionSize({ equity: 1000, score: 1, maxPositionSize: 10000, riskFraction: 0.5, volatility: 100 });
    expect(s).toBeLessThan(5);
  });
  it("planExecution single slice for tiny impact", () => {
    expect(planExecution(1, 1e6).slices).toBe(1);
  });
  it("planExecution many slices for huge order", () => {
    expect(planExecution(900, 1000).slices).toBeGreaterThan(2);
  });
  it("slippage grows with sqrt of impact", () => {
    const a = planExecution(100, 10000).estimatedSlippageBps;
    const b = planExecution(400, 10000).estimatedSlippageBps;
    expect(b).toBeGreaterThan(a);
  });
});
