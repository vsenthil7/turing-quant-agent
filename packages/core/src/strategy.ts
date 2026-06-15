/** Strategy registry: pluggable, comparable strategies. Pure. */
import { ensemble, type SignalWeights } from "./ensemble.js";
import { classifyRegime, adaptWeights, type RegimeThresholds } from "./regime.js";

export interface StrategyContext {
  closes: number[];
  fast: number;
  slow: number;
  threshold: number;
}

export interface StrategyResult {
  action: -1 | 0 | 1;
  score: number;
  meta: Record<string, unknown>;
}

export interface Strategy {
  name: string;
  evaluate(ctx: StrategyContext): StrategyResult;
}

/** Static-weight ensemble strategy. */
export function staticEnsembleStrategy(weights: SignalWeights): Strategy {
  return {
    name: "static-ensemble",
    evaluate(ctx) {
      const r = ensemble({ closes: ctx.closes, weights, fast: ctx.fast, slow: ctx.slow, threshold: ctx.threshold });
      return { action: r.action, score: r.score, meta: { contributions: r.contributions } };
    }
  };
}

/** Regime-adaptive strategy: weights shift with detected regime. */
export function regimeAdaptiveStrategy(base: SignalWeights, t: RegimeThresholds): Strategy {
  return {
    name: "regime-adaptive",
    evaluate(ctx) {
      const regime = classifyRegime(ctx.closes, ctx.fast, ctx.slow, t);
      const weights = adaptWeights(regime, base);
      const r = ensemble({ closes: ctx.closes, weights, fast: ctx.fast, slow: ctx.slow, threshold: ctx.threshold });
      return { action: r.action, score: r.score, meta: { regime, contributions: r.contributions } };
    }
  };
}

export class StrategyRegistry {
  private strategies = new Map<string, Strategy>();
  register(s: Strategy): void {
    if (this.strategies.has(s.name)) throw new Error(`duplicate strategy: ${s.name}`);
    this.strategies.set(s.name, s);
  }
  get(name: string): Strategy {
    const s = this.strategies.get(name);
    if (!s) throw new Error(`unknown strategy: ${name}`);
    return s;
  }
  names(): string[] { return [...this.strategies.keys()]; }
  /** Evaluate all registered strategies on the same context for comparison. */
  evaluateAll(ctx: StrategyContext): Record<string, StrategyResult> {
    const out: Record<string, StrategyResult> = {};
    for (const [name, s] of this.strategies) out[name] = s.evaluate(ctx);
    return out;
  }
}
