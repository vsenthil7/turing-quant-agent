import { describe, it, expect } from "vitest";
import { ema, rsi, volatility, macd, bollingerPosition } from "../src/indicators.js";

const up = Array.from({ length: 40 }, (_, i) => 100 + i);       // steady uptrend
const down = Array.from({ length: 40 }, (_, i) => 140 - i);     // steady downtrend
const flat = Array.from({ length: 40 }, () => 100);

describe("ema", () => {
  it("tracks an uptrend above the start", () => expect(ema(up, 10)).toBeGreaterThan(100));
  it("throws on bad period", () => expect(() => ema(up, 0)).toThrow(RangeError));
  it("throws on insufficient data", () => expect(() => ema([1, 2], 10)).toThrow(RangeError));
  it("throws on non-finite", () => expect(() => ema([1, NaN, 3, 4], 2)).toThrow(RangeError));
});

describe("rsi", () => {
  it("near 100 on pure uptrend", () => expect(rsi(up)).toBeGreaterThan(95));
  it("near 0 on pure downtrend", () => expect(rsi(down)).toBeLessThan(5));
  it("throws on bad period", () => expect(() => rsi(up, 0)).toThrow(RangeError));
});

describe("volatility", () => {
  it("is ~0 on flat series", () => expect(volatility(flat, 10)).toBeCloseTo(0));
  it("is positive on trending series", () => expect(volatility(up, 10)).toBeGreaterThan(0));
  it("throws on period < 2", () => expect(() => volatility(up, 1)).toThrow(RangeError));
});

describe("macd", () => {
  it("positive histogram in uptrend region", () => {
    const m = macd(up);
    expect(m).toHaveProperty("histogram");
    expect(Number.isFinite(m.macd)).toBe(true);
  });
  it("throws when fast >= slow", () => expect(() => macd(up, 26, 12)).toThrow(RangeError));
});

describe("bollingerPosition", () => {
  it("returns 0.5 on flat (zero sd)", () => expect(bollingerPosition(flat)).toBe(0.5));
  it("high in strong uptrend", () => expect(bollingerPosition(up)).toBeGreaterThan(0.5));
});

describe("rsi flat-market edge", () => {
  it("returns 50 (neutral) on a perfectly flat series", async () => {
    const { rsi } = await import("../src/indicators.js");
    expect(rsi(Array.from({ length: 20 }, () => 100))).toBe(50);
  });
  it("returns 100 on pure gains", async () => {
    const { rsi } = await import("../src/indicators.js");
    expect(rsi(Array.from({ length: 20 }, (_, i) => 100 + i))).toBe(100);
  });
});
