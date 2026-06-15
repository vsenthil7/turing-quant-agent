import { describe, it, expect } from "vitest";
import { ensemble } from "../src/ensemble.js";

const up = Array.from({ length: 40 }, (_, i) => 100 + i);
const down = Array.from({ length: 40 }, (_, i) => 140 - i);
const w = { trend: 1, momentum: 1, macd: 1, meanRev: 1 };

describe("ensemble", () => {
  it("goes long on a clear uptrend", () => {
    const r = ensemble({ closes: up, weights: w, fast: 5, slow: 20, threshold: 0.1 });
    expect(r.action).toBe(1);
    expect(r.score).toBeGreaterThan(0);
  });
  it("goes short on a clear downtrend", () => {
    const r = ensemble({ closes: down, weights: w, fast: 5, slow: 20, threshold: 0.1 });
    expect(r.action).toBe(-1);
  });
  it("holds when score below threshold", () => {
    const r = ensemble({ closes: up, weights: w, fast: 5, slow: 20, threshold: 0.99 });
    expect(r.action).toBe(0);
  });
  it("exposes per-signal contributions", () => {
    const r = ensemble({ closes: up, weights: w, fast: 5, slow: 20, threshold: 0.1 });
    expect(r.contributions).toHaveLength(4);
    expect(r.contributions.map(c => c.name)).toContain("trend");
  });
  it("throws when weights sum to zero", () => {
    expect(() => ensemble({ closes: up, weights: { trend: 0, momentum: 0, macd: 0, meanRev: 0 }, fast: 5, slow: 20, threshold: 0.1 }))
      .toThrow(RangeError);
  });
});
