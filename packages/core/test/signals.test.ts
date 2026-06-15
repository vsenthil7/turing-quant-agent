import { describe, it, expect } from "vitest";
import { sma, smaCross, crossToAction } from "../src/signals.js";

describe("sma", () => {
  it("computes average of last period", () => {
    expect(sma([1, 2, 3, 4], 2)).toBe(3.5);
  });
  it("uses full series when period equals length", () => {
    expect(sma([2, 4], 2)).toBe(3);
  });
  it("throws on period <= 0", () => {
    expect(() => sma([1, 2], 0)).toThrow(RangeError);
  });
  it("throws on insufficient data", () => {
    expect(() => sma([1], 2)).toThrow(RangeError);
  });
  it("throws on non-finite close", () => {
    expect(() => sma([1, NaN], 2)).toThrow(RangeError);
  });
});

describe("smaCross", () => {
  // rising series after a dip -> fast crosses above slow = golden
  const golden = [10, 9, 8, 7, 6, 5, 6, 7];
  const death = [1, 2, 3, 4, 5, 6, 5, 4];
  it("detects golden cross", () => {
    expect(smaCross(golden, 2, 4)).toBe("golden");
  });
  it("detects death cross", () => {
    expect(smaCross(death, 2, 4)).toBe("death");
  });
  it("returns none when no cross", () => {
    expect(smaCross([5, 5, 5, 5, 5, 5], 2, 4)).toBe("none");
  });
  it("throws when fast >= slow", () => {
    expect(() => smaCross(golden, 4, 4)).toThrow(RangeError);
  });
  it("throws on insufficient data", () => {
    expect(() => smaCross([1, 2, 3], 2, 4)).toThrow(RangeError);
  });
});

describe("crossToAction", () => {
  it("golden -> 1", () => expect(crossToAction("golden")).toBe(1));
  it("death -> -1", () => expect(crossToAction("death")).toBe(-1));
  it("none -> 0", () => expect(crossToAction("none")).toBe(0));
});
