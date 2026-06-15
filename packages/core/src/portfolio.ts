/** Multi-asset portfolio allocation + exposure tracking. Pure. */

export interface AssetSignal { asset: string; score: number; } // score in -1..1

export interface Allocation { asset: string; weight: number; } // signed, sums |w| <= 1

/**
 * Allocate capital across assets proportional to absolute signal strength,
 * sign preserved (long/short), normalized so total gross exposure <= 1.
 */
export function allocate(signals: AssetSignal[], maxGross = 1): Allocation[] {
  if (signals.length === 0) throw new RangeError("no signals");
  if (maxGross <= 0 || maxGross > 1) throw new RangeError("maxGross in (0,1]");
  const totalAbs = signals.reduce((a, s) => a + Math.abs(s.score), 0);
  if (totalAbs === 0) return signals.map(s => ({ asset: s.asset, weight: 0 }));
  return signals.map(s => ({
    asset: s.asset,
    weight: (s.score / totalAbs) * maxGross
  }));
}

/** Gross (sum |w|) and net (sum w) exposure of an allocation. */
export function exposure(alloc: Allocation[]): { gross: number; net: number } {
  return {
    gross: alloc.reduce((a, x) => a + Math.abs(x.weight), 0),
    net: alloc.reduce((a, x) => a + x.weight, 0)
  };
}

/** Pearson correlation between two equal-length return series. */
export function correlation(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new RangeError("length mismatch");
  if (a.length < 2) throw new RangeError("need >= 2 points");
  const ma = a.reduce((x, y) => x + y, 0) / a.length;
  const mb = b.reduce((x, y) => x + y, 0) / b.length;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) {
    const xa = a[i]! - ma, xb = b[i]! - mb;
    num += xa * xb; da += xa * xa; db += xb * xb;
  }
  if (da === 0 || db === 0) return 0;
  return num / Math.sqrt(da * db);
}
