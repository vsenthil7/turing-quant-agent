import { describe, it, expect } from "vitest";
import { ensemble } from "../src/ensemble.js";

const flat = Array.from({ length: 40 }, () => 100);
const w = { trend: 1, momentum: 1, macd: 1, meanRev: 1 };

describe("ensemble edge cases", () => {
  it("flat market yields near-zero score => hold", () => {
    const r = ensemble({ closes: flat, weights: w, fast: 5, slow: 20, threshold: 0.1 });
    expect(r.action).toBe(0);
  });
  it("contributions always sum to score", () => {
    const up = Array.from({ length: 40 }, (_, i) => 100 + i);
    const r = ensemble({ closes: up, weights: w, fast: 5, slow: 20, threshold: 0.1 });
    const sum = r.contributions.reduce((a, c) => a + c.weighted, 0);
    expect(sum).toBeCloseTo(r.score);
  });
  it("zero threshold makes any nonzero score actionable", () => {
    const up = Array.from({ length: 40 }, (_, i) => 100 + i);
    const r = ensemble({ closes: up, weights: w, fast: 5, slow: 20, threshold: 0 });
    expect(r.action).not.toBe(0);
  });
  it("uneven weights still normalize", () => {
    const up = Array.from({ length: 40 }, (_, i) => 100 + i);
    const r = ensemble({ closes: up, weights: { trend: 10, momentum: 1, macd: 1, meanRev: 1 }, fast: 5, slow: 20, threshold: 0.1 });
    expect(Math.abs(r.score)).toBeLessThanOrEqual(1);
  });
})
