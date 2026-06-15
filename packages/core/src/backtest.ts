/** Deterministic backtest engine. Pure: no time, no rng, no I/O. */
import { smaCross, crossToAction } from "./signals.js";

export interface BacktestParams {
  closes: number[];
  fast: number;
  slow: number;
}

export interface BacktestResult {
  trades: number;
  finalReturn: number; // cumulative fractional return
}

export function backtest(p: BacktestParams): BacktestResult {
  const { closes, fast, slow } = p;
  if (closes.length < slow + 2) throw new RangeError("not enough data");
  let position: -1 | 0 | 1 = 0;
  let trades = 0;
  let cumReturn = 0;
  for (let i = slow + 1; i < closes.length; i++) {
    const window = closes.slice(0, i + 1);
    const action = crossToAction(smaCross(window, fast, slow));
    if (action !== 0 && action !== position) {
      position = action;
      trades++;
    }
    const ret = (closes[i]! - closes[i - 1]!) / closes[i - 1]!;
    cumReturn += position * ret;
  }
  return { trades, finalReturn: cumReturn };
}
