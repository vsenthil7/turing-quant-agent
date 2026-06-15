/** Position sizing + execution planning. Pure, deterministic. */

export interface SizingParams {
  equity: number;
  score: number;          // ensemble score -1..1 (confidence proxy)
  maxPositionSize: number;
  riskFraction: number;   // 0..1 fraction of equity to risk at full confidence
  volatility: number;     // current vol, scales size down when high
}

/** Volatility-targeted, confidence-scaled position size. */
export function positionSize(p: SizingParams): number {
  if (p.equity <= 0) throw new RangeError("equity must be > 0");
  if (p.riskFraction < 0 || p.riskFraction > 1) throw new RangeError("riskFraction 0..1");
  if (p.volatility < 0) throw new RangeError("volatility >= 0");
  const confidence = Math.min(1, Math.abs(p.score));
  // vol scaling: higher vol -> smaller size. floor vol at small epsilon.
  const volScale = 1 / (1 + p.volatility * 10);
  const raw = p.equity * p.riskFraction * confidence * volScale;
  return Math.min(raw, p.maxPositionSize);
}

export interface ExecutionPlan {
  size: number;
  slices: number;          // TWAP-style splitting for large orders
  estimatedSlippageBps: number;
}

/** Plan execution: split large orders, estimate slippage from size/liquidity. */
export function planExecution(size: number, liquidity: number): ExecutionPlan {
  if (size < 0) throw new RangeError("size >= 0");
  if (liquidity <= 0) throw new RangeError("liquidity must be > 0");
  const impact = size / liquidity; // fraction of pool
  const slices = impact > 0.1 ? Math.ceil(impact / 0.05) : 1;
  // simple square-root market impact model, in bps
  const estimatedSlippageBps = Math.round(Math.sqrt(impact) * 100);
  return { size, slices, estimatedSlippageBps };
}
