/** Trading cost + funding model for net PnL. Pure. */

export interface CostModel {
  feeBps: number;        // taker fee in basis points per trade
  slippageBps: number;   // estimated slippage in bps
  fundingBpsPerPeriod: number; // perp funding cost per holding period
}

/** Cost of entering/exiting a position of given notional. */
export function tradeCost(notional: number, m: CostModel): number {
  if (notional < 0) throw new RangeError("notional >= 0");
  return notional * (m.feeBps + m.slippageBps) / 10_000;
}

/** Funding cost for holding a notional across N periods. */
export function fundingCost(notional: number, periods: number, m: CostModel): number {
  if (notional < 0 || periods < 0) throw new RangeError("inputs >= 0");
  return notional * (m.fundingBpsPerPeriod / 10_000) * periods;
}

/** Net PnL = gross - entry cost - exit cost - funding. */
export function netPnl(grossPnl: number, notional: number, periods: number, m: CostModel): number {
  const entry = tradeCost(notional, m);
  const exit = tradeCost(notional, m);
  const funding = fundingCost(notional, periods, m);
  return grossPnl - entry - exit - funding;
}
