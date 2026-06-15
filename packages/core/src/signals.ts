/** Pure signal calculators. No I/O; inject all data. Deterministic. */

export interface Candle { close: number; }

/** Simple moving average over the last `period` closes. */
export function sma(closes: number[], period: number): number {
  if (period <= 0) throw new RangeError("period must be > 0");
  if (closes.length < period) throw new RangeError("not enough data");
  let sum = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const v = closes[i]!;
    if (!Number.isFinite(v)) throw new RangeError("non-finite close");
    sum += v;
  }
  return sum / period;
}

export type Cross = "golden" | "death" | "none";

/** Detect SMA crossover between fast and slow on the latest bar. */
export function smaCross(closes: number[], fast: number, slow: number): Cross {
  if (fast >= slow) throw new RangeError("fast must be < slow");
  if (closes.length < slow + 1) throw new RangeError("not enough data");
  const prev = closes.slice(0, -1);
  const fNow = sma(closes, fast), sNow = sma(closes, slow);
  const fPrev = sma(prev, fast), sPrev = sma(prev, slow);
  if (fPrev <= sPrev && fNow > sNow) return "golden";
  if (fPrev >= sPrev && fNow < sNow) return "death";
  return "none";
}

/** Map a crossover to an action: 1 long, -1 short, 0 hold. */
export function crossToAction(c: Cross): -1 | 0 | 1 {
  if (c === "golden") return 1;
  if (c === "death") return -1;
  return 0;
}
