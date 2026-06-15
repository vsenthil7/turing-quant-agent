/** Enterprise indicator library. All pure, deterministic, validated. */

function assertSeries(xs: number[], min: number): void {
  if (xs.length < min) throw new RangeError("not enough data");
  for (const x of xs) if (!Number.isFinite(x)) throw new RangeError("non-finite value");
}

/** Exponential moving average (last value). */
export function ema(closes: number[], period: number): number {
  if (period <= 0) throw new RangeError("period must be > 0");
  assertSeries(closes, period);
  const k = 2 / (period + 1);
  let prev = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    prev = closes[i]! * k + prev * (1 - k);
  }
  return prev;
}

/** Relative Strength Index (Wilder). Returns 0..100. */
export function rsi(closes: number[], period = 14): number {
  if (period <= 0) throw new RangeError("period must be > 0");
  assertSeries(closes, period + 1);
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i]! - closes[i - 1]!;
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgGain = gain / period, avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    const g = d >= 0 ? d : 0, l = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100; // flat = neutral, pure gains = 100
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Rolling standard deviation of returns (volatility). */
export function volatility(closes: number[], period: number): number {
  if (period < 2) throw new RangeError("period must be >= 2");
  assertSeries(closes, period + 1);
  const rets: number[] = [];
  for (let i = closes.length - period; i < closes.length; i++) {
    rets.push((closes[i]! - closes[i - 1]!) / closes[i - 1]!);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance);
}

/** MACD line + signal line + histogram. */
export interface Macd { macd: number; signal: number; histogram: number; }
export function macd(closes: number[], fast = 12, slow = 26, sig = 9): Macd {
  if (fast >= slow) throw new RangeError("fast must be < slow");
  assertSeries(closes, slow + sig);
  // build macd series then ema of it for signal
  const macdSeries: number[] = [];
  for (let i = slow; i <= closes.length; i++) {
    const w = closes.slice(0, i);
    macdSeries.push(ema(w, fast) - ema(w, slow));
  }
  const macdLine = macdSeries[macdSeries.length - 1]!;
  const signal = ema(macdSeries, sig);
  return { macd: macdLine, signal, histogram: macdLine - signal };
}

/** Bollinger band position: where price sits in the band (0..1, can exceed). */
export function bollingerPosition(closes: number[], period = 20, mult = 2): number {
  assertSeries(closes, period);
  const window = closes.slice(-period);
  const mean = window.reduce((a, b) => a + b, 0) / period;
  const sd = Math.sqrt(window.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
  if (sd === 0) return 0.5;
  const upper = mean + mult * sd, lower = mean - mult * sd;
  const price = closes[closes.length - 1]!;
  return (price - lower) / (upper - lower);
}
