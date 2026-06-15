/** Pure risk rules for the quant agent. No I/O, fully deterministic. */

export interface RiskLimits {
  maxPositionSize: number; // absolute units
  maxDrawdownPct: number;  // 0..1, halt threshold
}

export interface PortfolioState {
  equity: number;        // current equity
  peakEquity: number;    // high-water mark
  openPosition: number;  // absolute units
}

export type RiskDecision =
  | { allowed: true }
  | { allowed: false; reason: "position" | "drawdown" | "invalid" };

export function evaluateRisk(
  state: PortfolioState,
  proposedSize: number,
  limits: RiskLimits
): RiskDecision {
  if (
    !Number.isFinite(proposedSize) ||
    proposedSize < 0 ||
    state.peakEquity <= 0 ||
    state.equity < 0
  ) {
    return { allowed: false, reason: "invalid" };
  }
  const drawdown = (state.peakEquity - state.equity) / state.peakEquity;
  if (drawdown >= limits.maxDrawdownPct) {
    return { allowed: false, reason: "drawdown" };
  }
  if (state.openPosition + proposedSize > limits.maxPositionSize) {
    return { allowed: false, reason: "position" };
  }
  return { allowed: true };
}
