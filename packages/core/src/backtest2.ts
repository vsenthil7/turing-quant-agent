/** Backtest engine v2: strategy-driven, position-aware, cost-aware.
 *  Returns a full performance report. Pure, deterministic. */
import type { Strategy } from "./strategy.js";
import { transition, type Position } from "./position.js";
import { netPnl, type CostModel } from "./costs.js";
import { performanceReport, type PerfReport } from "./analytics.js";

export interface Backtest2Params {
  closes: number[];
  strategy: Strategy;
  fast: number;
  slow: number;
  threshold: number;
  notional: number;     // fixed notional per position
  costs: CostModel;
  warmup: number;       // bars before trading starts
}

export interface Backtest2Result {
  report: PerfReport;
  trades: number;
  netReturns: number[]; // per-bar net return on notional
}

export function backtest2(p: Backtest2Params): Backtest2Result {
  if (p.warmup < p.slow) throw new RangeError("warmup must be >= slow");
  if (p.closes.length <= p.warmup + 1) throw new RangeError("not enough data after warmup");
  let position: Position | null = null;
  let trades = 0;
  const netReturns: number[] = [];

  for (let i = p.warmup; i < p.closes.length; i++) {
    const window = p.closes.slice(0, i + 1);
    const price = p.closes[i]!;
    const { action } = p.strategy.evaluate({ closes: window, fast: p.fast, slow: p.slow, threshold: p.threshold });
    const before = position;
    const result = transition(position, action, p.notional / price, price);
    position = result.position;

    // count a trade whenever open state or side changes
    const changed = (before?.open ? before.side : "flat") !== (position?.open ? position.side : "flat");
    let barNet = 0;
    if (result.realizedPnl !== 0 || changed) {
      trades++;
      const gross = result.realizedPnl;
      barNet = netPnl(gross, p.notional, 1, p.costs) / p.notional;
    } else if (position?.open) {
      // mark-to-market unrealized step on held position
      const prev = p.closes[i - 1]!;
      const dir = position.side === "long" ? 1 : -1;
      barNet = (dir * (price - prev) / prev);
    }
    netReturns.push(barNet);
  }

  // netReturns is guaranteed non-empty: the warmup guard above ensures the loop
  // runs at least once, so no empty-array fallback is needed.
  return { report: performanceReport(netReturns), trades, netReturns };
}
