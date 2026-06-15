/** Additional pluggable strategies: momentum, breakout, mean-reversion. Pure. */
import { rsi, ema } from "./indicators.js";
import type { Strategy, StrategyContext, StrategyResult } from "./strategy.js";

/** Momentum: long when RSI rising above 50, short below. */
export function momentumStrategy(threshold = 55): Strategy {
  return {
    name: "momentum",
    evaluate(ctx: StrategyContext): StrategyResult {
      const r = rsi(ctx.closes);
      const action = r >= threshold ? 1 : r <= 100 - threshold ? -1 : 0;
      return { action, score: (r - 50) / 50, meta: { rsi: r } };
    }
  };
}

/** Breakout: long when price exceeds recent high, short below recent low. */
export function breakoutStrategy(lookback = 20): Strategy {
  return {
    name: "breakout",
    evaluate(ctx: StrategyContext): StrategyResult {
      if (ctx.closes.length < lookback + 1) throw new RangeError("not enough data");
      const window = ctx.closes.slice(-lookback - 1, -1);
      const price = ctx.closes[ctx.closes.length - 1]!;
      const hi = Math.max(...window), lo = Math.min(...window);
      const action = price > hi ? 1 : price < lo ? -1 : 0;
      const score = action === 1 ? (price - hi) / hi : action === -1 ? (price - lo) / lo : 0;
      return { action, score: Math.max(-1, Math.min(1, score * 20)), meta: { hi, lo, price } };
    }
  };
}

/** Mean-reversion: fade extremes vs EMA. */
export function meanReversionStrategy(period = 20, bandPct = 0.02): Strategy {
  return {
    name: "mean-reversion",
    evaluate(ctx: StrategyContext): StrategyResult {
      const mean = ema(ctx.closes, period);
      const price = ctx.closes[ctx.closes.length - 1]!;
      const dev = (price - mean) / mean;
      // price far above mean -> short (revert down); far below -> long
      const action = dev > bandPct ? -1 : dev < -bandPct ? 1 : 0;
      return { action, score: Math.max(-1, Math.min(1, -dev * 20)), meta: { mean, dev } };
    }
  };
}
