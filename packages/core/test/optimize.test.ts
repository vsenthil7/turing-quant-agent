import { describe, it, expect } from "vitest";
import { sweep, best, walkForward } from "../src/optimize.js";

const data = Array.from({ length: 60 }, (_, i) => 100 + 10 * Math.sin(i / 5) + i * 0.3);
const grid = { fast: [3, 5], slow: [10, 20] };

describe("sweep", () => {
  it("evaluates valid combos only", () => {
    const rows = sweep(data, grid);
    expect(rows.length).toBe(4); // all fast<slow
    expect(rows.every(r => r.params.fast < r.params.slow)).toBe(true);
  });
  it("skips combos where fast >= slow", () => {
    // grid includes fast=10 slow=10 (equal) and fast=20 slow=10 (inverted) -> both skipped
    const rows = sweep(data, { fast: [5, 10, 20], slow: [10] });
    expect(rows.every(r => r.params.fast < r.params.slow)).toBe(true);
    expect(rows.length).toBe(1); // only fast=5,slow=10 valid
  });
  it("throws when no valid combos", () => {
    expect(() => sweep([1, 2, 3], grid)).toThrow(RangeError);
  });
  it("skips combos whose slow exceeds available data", () => {
    // short series: slow=20 invalid, slow=10 valid -> some skipped, some kept
    const short = Array.from({ length: 14 }, (_, i) => 100 + i);
    const rows = sweep(short, { fast: [3], slow: [10, 20] });
    expect(rows.every(r => r.params.slow === 10)).toBe(true);
  });
});

describe("best", () => {
  it("picks highest return", () => {
    const rows = [
      { params: { fast: 3, slow: 10 }, finalReturn: 0.1, trades: 5 },
      { params: { fast: 5, slow: 20 }, finalReturn: 0.2, trades: 3 }
    ];
    expect(best(rows).finalReturn).toBe(0.2);
  });
  it("breaks ties by fewer trades", () => {
    const rows = [
      { params: { fast: 3, slow: 10 }, finalReturn: 0.1, trades: 5 },
      { params: { fast: 5, slow: 20 }, finalReturn: 0.1, trades: 2 }
    ];
    expect(best(rows).trades).toBe(2);
  });
  it("throws on empty", () => expect(() => best([])).toThrow(RangeError));
});

describe("walkForward", () => {
  it("returns IS/OOS with degradation", () => {
    const r = walkForward(data, grid, 0.6);
    expect(r).toHaveProperty("inSample");
    expect(r).toHaveProperty("outOfSampleReturn");
    expect(typeof r.degradation).toBe("number");
  });
  it("throws on bad trainFrac", () => {
    expect(() => walkForward(data, grid, 1.5)).toThrow(RangeError);
  });
});
