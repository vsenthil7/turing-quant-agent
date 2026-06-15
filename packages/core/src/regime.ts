/** Market regime classification + regime-adaptive ensemble weighting. Pure. */
import { volatility } from "./indicators.js";
import { ema } from "./indicators.js";
import type { SignalWeights } from "./ensemble.js";

export type MarketRegime = "trending" | "ranging" | "volatile";

export interface RegimeThresholds {
  volHigh: number;     // above => volatile
  trendStrength: number; // |ema gap| above => trending
}

/** Classify regime from price action: trend strength + volatility. */
export function classifyRegime(closes: number[], fast: number, slow: number, t: RegimeThresholds): MarketRegime {
  const vol = volatility(closes, Math.min(20, closes.length - 1));
  if (vol >= t.volHigh) return "volatile";
  const gap = Math.abs(ema(closes, fast) - ema(closes, slow)) / ema(closes, slow);
  if (gap >= t.trendStrength) return "trending";
  return "ranging";
}

/**
 * Adapt ensemble weights to the regime:
 * - trending: favor trend + macd.
 * - ranging: favor mean-reversion + momentum.
 * - volatile: flatten weights, reduce conviction (lower all, raised meanRev).
 */
export function adaptWeights(regime: MarketRegime, base: SignalWeights): SignalWeights {
  switch (regime) {
    case "trending":
      return { trend: base.trend * 1.5, momentum: base.momentum, macd: base.macd * 1.5, meanRev: base.meanRev * 0.5 };
    case "ranging":
      return { trend: base.trend * 0.5, momentum: base.momentum * 1.2, macd: base.macd * 0.5, meanRev: base.meanRev * 1.8 };
    case "volatile":
      return { trend: base.trend * 0.6, momentum: base.momentum * 0.6, macd: base.macd * 0.6, meanRev: base.meanRev * 1.2 };
  }
}
