import { describe, it, expect } from "vitest";
import { evaluateRisk } from "../src/risk.js";

const limits = { maxPositionSize: 100, maxDrawdownPct: 0.2 };
const base = { equity: 1000, peakEquity: 1000, openPosition: 0 };

describe("evaluateRisk — happy", () => {
  it("allows within all limits", () => {
    expect(evaluateRisk(base, 50, limits)).toEqual({ allowed: true });
  });
  it("allows exactly at position limit", () => {
    expect(evaluateRisk(base, 100, limits)).toEqual({ allowed: true });
  });
});

describe("evaluateRisk — negative", () => {
  it("rejects over position limit", () => {
    expect(evaluateRisk(base, 101, limits)).toEqual({ allowed: false, reason: "position" });
  });
  it("rejects on drawdown breach", () => {
    const s = { equity: 800, peakEquity: 1000, openPosition: 0 };
    expect(evaluateRisk(s, 1, limits)).toEqual({ allowed: false, reason: "drawdown" });
  });
  it("rejects negative size", () => {
    expect(evaluateRisk(base, -1, limits)).toEqual({ allowed: false, reason: "invalid" });
  });
  it("rejects NaN size", () => {
    expect(evaluateRisk(base, NaN, limits)).toEqual({ allowed: false, reason: "invalid" });
  });
  it("rejects non-positive peak equity", () => {
    expect(evaluateRisk({ equity: 0, peakEquity: 0, openPosition: 0 }, 1, limits))
      .toEqual({ allowed: false, reason: "invalid" });
  });
  it("rejects negative equity", () => {
    expect(evaluateRisk({ equity: -5, peakEquity: 1000, openPosition: 0 }, 1, limits))
      .toEqual({ allowed: false, reason: "invalid" });
  });
});
