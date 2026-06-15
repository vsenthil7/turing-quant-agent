import { describe, it, expect } from "vitest";
import { classifyRegime, adaptWeights } from "../src/regime.js";

const t = { volHigh: 0.05, trendStrength: 0.02 };
const trending = Array.from({ length: 40 }, (_, i) => 100 + i * 2);
const ranging = Array.from({ length: 40 }, (_, i) => 100 + Math.sin(i) * 0.5);
const volatile = Array.from({ length: 40 }, (_, i) => 100 + (i % 2 === 0 ? 15 : -15));
const base = { trend: 1, momentum: 1, macd: 1, meanRev: 1 };

describe("classifyRegime", () => {
  it("detects trending", () => expect(classifyRegime(trending, 5, 20, t)).toBe("trending"));
  it("detects ranging", () => expect(classifyRegime(ranging, 5, 20, t)).toBe("ranging"));
  it("detects volatile", () => expect(classifyRegime(volatile, 5, 20, t)).toBe("volatile"));
});

describe("adaptWeights", () => {
  it("trending boosts trend + macd", () => {
    const w = adaptWeights("trending", base);
    expect(w.trend).toBeGreaterThan(base.trend);
    expect(w.meanRev).toBeLessThan(base.meanRev);
  });
  it("ranging boosts meanRev", () => {
    const w = adaptWeights("ranging", base);
    expect(w.meanRev).toBeGreaterThan(base.meanRev);
  });
  it("volatile reduces conviction", () => {
    const w = adaptWeights("volatile", base);
    expect(w.trend).toBeLessThan(base.trend);
  });
});
