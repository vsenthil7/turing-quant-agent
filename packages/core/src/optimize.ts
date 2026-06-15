/** Parameter sweep + walk-forward validation. Pure, deterministic. */
import { backtest } from "./backtest.js";

export interface ParamGrid { fast: number[]; slow: number[]; }
export interface ParamSet { fast: number; slow: number; }
export interface SweepRow { params: ParamSet; finalReturn: number; trades: number; }

/** Evaluate every valid (fast < slow) combo on a return series. */
export function sweep(closes: number[], grid: ParamGrid): SweepRow[] {
  const rows: SweepRow[] = [];
  for (const fast of grid.fast) {
    for (const slow of grid.slow) {
      if (fast >= slow) continue;
      if (closes.length < slow + 2) continue;
      const r = backtest({ closes, fast, slow });
      rows.push({ params: { fast, slow }, finalReturn: r.finalReturn, trades: r.trades });
    }
  }
  if (rows.length === 0) throw new RangeError("no valid parameter combos for data");
  return rows;
}

/** Pick the best parameter set by final return (ties -> fewer trades). */
export function best(rows: SweepRow[]): SweepRow {
  if (rows.length === 0) throw new RangeError("empty sweep");
  return rows.reduce((bestRow, row) => {
    if (row.finalReturn > bestRow.finalReturn) return row;
    if (row.finalReturn === bestRow.finalReturn && row.trades < bestRow.trades) return row;
    return bestRow;
  });
}

export interface WalkForwardResult {
  inSample: ParamSet;
  inSampleReturn: number;
  outOfSampleReturn: number;
  degradation: number; // in-sample minus out-of-sample
}

/**
 * Optimize on the first `trainFrac` of data, validate on the rest.
 * Detects overfitting via the degradation between IS and OOS returns.
 */
export function walkForward(closes: number[], grid: ParamGrid, trainFrac: number): WalkForwardResult {
  if (trainFrac <= 0 || trainFrac >= 1) throw new RangeError("trainFrac in (0,1)");
  const split = Math.floor(closes.length * trainFrac);
  const train = closes.slice(0, split);
  const test = closes.slice(split);
  const bestIn = best(sweep(train, grid));
  const oos = backtest({ closes: test, fast: bestIn.params.fast, slow: bestIn.params.slow });
  return {
    inSample: bestIn.params,
    inSampleReturn: bestIn.finalReturn,
    outOfSampleReturn: oos.finalReturn,
    degradation: bestIn.finalReturn - oos.finalReturn
  };
}
