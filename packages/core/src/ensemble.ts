/** Weighted signal ensemble. Combines indicator readings into a directional
 *  score in [-1, 1] with per-signal contributions for explainability. */
import { ema } from "./indicators.js";
import { rsi } from "./indicators.js";
import { macd } from "./indicators.js";
import { bollingerPosition } from "./indicators.js";

export interface SignalWeights {
  trend: number;      // ema fast vs slow
  momentum: number;   // rsi
  macd: number;       // macd histogram sign
  meanRev: number;    // bollinger position
}

export interface SignalContribution {
  name: keyof SignalWeights;
  raw: number;        // normalized -1..1 reading
  weight: number;
  weighted: number;
}

export interface EnsembleResult {
  score: number;                  // -1..1
  action: -1 | 0 | 1;             // thresholded
  contributions: SignalContribution[];
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function normalizeWeights(w: SignalWeights): SignalWeights {
  const sum = w.trend + w.momentum + w.macd + w.meanRev;
  if (sum <= 0) throw new RangeError("weights must sum > 0");
  return { trend: w.trend / sum, momentum: w.momentum / sum, macd: w.macd / sum, meanRev: w.meanRev / sum };
}

export interface EnsembleParams {
  closes: number[];
  weights: SignalWeights;
  fast: number;
  slow: number;
  threshold: number; // |score| below this => hold
}

export function ensemble(p: EnsembleParams): EnsembleResult {
  const w = normalizeWeights(p.weights);

  // trend: ema fast vs slow, normalized by relative gap
  const ef = ema(p.closes, p.fast), es = ema(p.closes, p.slow);
  const trendRaw = clamp((ef - es) / es * 10, -1, 1);

  // momentum: rsi mapped from [0,100] to [-1,1]
  const momentumRaw = clamp((rsi(p.closes) - 50) / 50, -1, 1);

  // macd histogram sign + magnitude (normalized by price)
  const m = macd(p.closes);
  const macdRaw = clamp(m.histogram / es * 50, -1, 1);

  // mean reversion: bollinger position; high => overbought => negative signal
  const bb = bollingerPosition(p.closes);
  const meanRevRaw = clamp((0.5 - bb) * 2, -1, 1);

  const contributions: SignalContribution[] = [
    { name: "trend", raw: trendRaw, weight: w.trend, weighted: trendRaw * w.trend },
    { name: "momentum", raw: momentumRaw, weight: w.momentum, weighted: momentumRaw * w.momentum },
    { name: "macd", raw: macdRaw, weight: w.macd, weighted: macdRaw * w.macd },
    { name: "meanRev", raw: meanRevRaw, weight: w.meanRev, weighted: meanRevRaw * w.meanRev }
  ];

  const score = contributions.reduce((a, c) => a + c.weighted, 0);
  let action: -1 | 0 | 1 = 0;
  if (score >= p.threshold) action = 1;
  else if (score <= -p.threshold) action = -1;

  return { score, action, contributions };
}
