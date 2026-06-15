import { describe, it, expect } from "vitest";
import { staticEnsembleStrategy, regimeAdaptiveStrategy, StrategyRegistry } from "../src/strategy.js";

const up = Array.from({ length: 40 }, (_, i) => 100 + i);
const ctx = { closes: up, fast: 5, slow: 20, threshold: 0.1 };
const base = { trend: 1, momentum: 1, macd: 1, meanRev: 1 };
const t = { volHigh: 0.5, trendStrength: 0.01 };

describe("strategies", () => {
  it("static ensemble evaluates", () => {
    const r = staticEnsembleStrategy(base).evaluate(ctx);
    expect(r.action).toBe(1);
  });
  it("regime-adaptive includes regime in meta", () => {
    const r = regimeAdaptiveStrategy(base, t).evaluate(ctx);
    expect(r.meta).toHaveProperty("regime");
  });
});

describe("StrategyRegistry", () => {
  it("registers, gets, lists, compares", () => {
    const reg = new StrategyRegistry();
    reg.register(staticEnsembleStrategy(base));
    reg.register(regimeAdaptiveStrategy(base, t));
    expect(reg.names()).toHaveLength(2);
    expect(reg.get("static-ensemble").name).toBe("static-ensemble");
    const all = reg.evaluateAll(ctx);
    expect(Object.keys(all)).toHaveLength(2);
  });
  it("throws on duplicate", () => {
    const reg = new StrategyRegistry();
    reg.register(staticEnsembleStrategy(base));
    expect(() => reg.register(staticEnsembleStrategy(base))).toThrow("duplicate");
  });
  it("throws on unknown get", () => {
    expect(() => new StrategyRegistry().get("nope")).toThrow("unknown");
  });
});
