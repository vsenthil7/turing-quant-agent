import { describe, it, expect } from "vitest";
import { allocate, exposure, correlation } from "../src/portfolio.js";

describe("allocate", () => {
  it("weights proportional to abs score, sign preserved", () => {
    const a = allocate([{ asset: "X", score: 0.5 }, { asset: "Y", score: -0.5 }]);
    expect(a[0]!.weight).toBeCloseTo(0.5);
    expect(a[1]!.weight).toBeCloseTo(-0.5);
  });
  it("respects maxGross", () => {
    const a = allocate([{ asset: "X", score: 1 }, { asset: "Y", score: 1 }], 0.5);
    expect(exposure(a).gross).toBeCloseTo(0.5);
  });
  it("zero weights when all scores zero", () => {
    const a = allocate([{ asset: "X", score: 0 }]);
    expect(a[0]!.weight).toBe(0);
  });
  it("throws on empty", () => expect(() => allocate([])).toThrow(RangeError));
  it("throws on bad maxGross", () => expect(() => allocate([{ asset: "X", score: 1 }], 2)).toThrow(RangeError));
});

describe("exposure", () => {
  it("computes gross and net", () => {
    const e = exposure([{ asset: "X", weight: 0.4 }, { asset: "Y", weight: -0.3 }]);
    expect(e.gross).toBeCloseTo(0.7);
    expect(e.net).toBeCloseTo(0.1);
  });
});

describe("correlation", () => {
  it("is 1 for identical series", () => {
    expect(correlation([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
  it("is -1 for inverse series", () => {
    expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1);
  });
  it("is 0 for zero-variance series", () => {
    expect(correlation([1, 1, 1], [1, 2, 3])).toBe(0);
  });
  it("throws on length mismatch", () => expect(() => correlation([1], [1, 2])).toThrow(RangeError));
  it("throws on too few points", () => expect(() => correlation([1], [1])).toThrow(RangeError));
});
