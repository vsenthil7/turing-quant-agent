/** Performance analytics over a return series. Pure, deterministic. */

function assertReturns(rets: number[]): void {
  if (rets.length === 0) throw new RangeError("empty return series");
  for (const r of rets) if (!Number.isFinite(r)) throw new RangeError("non-finite return");
}

/** Annualized Sharpe ratio. periodsPerYear scales the result. */
export function sharpe(rets: number[], riskFree = 0, periodsPerYear = 252): number {
  assertReturns(rets);
  const excess = rets.map(r => r - riskFree / periodsPerYear);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  if (excess.length < 2) return 0;
  const variance = excess.reduce((a, b) => a + (b - mean) ** 2, 0) / (excess.length - 1);
  const sd = Math.sqrt(variance);
  if (sd === 0) return 0;
  return (mean / sd) * Math.sqrt(periodsPerYear);
}

/** Sortino ratio: like Sharpe but penalizes only downside deviation. */
export function sortino(rets: number[], riskFree = 0, periodsPerYear = 252): number {
  assertReturns(rets);
  const excess = rets.map(r => r - riskFree / periodsPerYear);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const downside = excess.filter(r => r < 0);
  if (downside.length === 0) return 0;
  // downside has only negative values, so sum of squares > 0 and dd > 0
  const dd = Math.sqrt(downside.reduce((a, b) => a + b ** 2, 0) / downside.length);
  return (mean / dd) * Math.sqrt(periodsPerYear);
}

/** Max drawdown (fraction, >= 0) from an equity curve. */
export function maxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) throw new RangeError("empty curve");
  let peak = equityCurve[0]!;
  let maxDd = 0;
  for (const v of equityCurve) {
    if (v > peak) peak = v;
    if (peak > 0) {
      const dd = (peak - v) / peak;
      if (dd > maxDd) maxDd = dd;
    }
  }
  return maxDd;
}

/** Build an equity curve from a starting equity and a return series. */
export function equityCurve(start: number, rets: number[]): number[] {
  if (start <= 0) throw new RangeError("start must be > 0");
  const curve = [start];
  let eq = start;
  for (const r of rets) { eq *= 1 + r; curve.push(eq); }
  return curve;
}

export interface Streaks { longestWin: number; longestLoss: number; }
/** Longest consecutive winning and losing streaks. */
export function streaks(rets: number[]): Streaks {
  assertReturns(rets);
  let longestWin = 0, longestLoss = 0, w = 0, l = 0;
  for (const r of rets) {
    if (r > 0) { w++; l = 0; if (w > longestWin) longestWin = w; }
    else if (r < 0) { l++; w = 0; if (l > longestLoss) longestLoss = l; }
    else { w = 0; l = 0; }
  }
  return { longestWin, longestLoss };
}

export interface PerfReport {
  totalReturn: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  winRate: number;
  streaks: Streaks;
}

/** Full performance report from a return series + starting equity. */
export function performanceReport(rets: number[], start = 1): PerfReport {
  assertReturns(rets);
  const curve = equityCurve(start, rets);
  const wins = rets.filter(r => r > 0).length;
  const decided = rets.filter(r => r !== 0).length;
  return {
    totalReturn: curve[curve.length - 1]! / start - 1,
    sharpe: sharpe(rets),
    sortino: sortino(rets),
    maxDrawdown: maxDrawdown(curve),
    winRate: decided === 0 ? 0 : wins / decided,
    streaks: streaks(rets)
  };
}
