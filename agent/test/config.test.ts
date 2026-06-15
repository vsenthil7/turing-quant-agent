import { describe, it, expect } from "vitest";
import { parseConfig } from "../src/config.js";

const good = {
  aiMode: "gate",
  risk: { maxPositionSize: 100, maxDrawdownPct: 0.2 },
  signals: { fast: 2, slow: 4, weights: { maCross: 0.6, momentum: 0.4 } },
  dryRun: false
};

describe("parseConfig — happy", () => {
  it("accepts a valid config", () => {
    expect(parseConfig(good).aiMode).toBe("gate");
  });
  it("accepts all three ai modes", () => {
    for (const m of ["driver", "gate", "advisor"]) {
      expect(parseConfig({ ...good, aiMode: m }).aiMode).toBe(m);
    }
  });
});

describe("parseConfig — negative", () => {
  it("rejects bad ai mode", () => {
    expect(() => parseConfig({ ...good, aiMode: "auto" })).toThrow();
  });
  it("rejects fast >= slow", () => {
    expect(() => parseConfig({ ...good, signals: { ...good.signals, fast: 5 } })).toThrow();
  });
  it("rejects drawdown > 1", () => {
    expect(() => parseConfig({ ...good, risk: { maxPositionSize: 1, maxDrawdownPct: 2 } })).toThrow();
  });
  it("rejects non-positive position size", () => {
    expect(() => parseConfig({ ...good, risk: { maxPositionSize: 0, maxDrawdownPct: 0.2 } })).toThrow();
  });
});
