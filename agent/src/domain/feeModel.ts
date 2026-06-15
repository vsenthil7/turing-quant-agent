/** Fee schedule + computation for the custody/business layer. Pure. */

export interface FeeSchedule {
  managementBps: number;   // annual, on AUM
  performanceBps: number;  // on positive PnL above high-water mark
}

/** Performance fee on profit above the high-water mark. */
export function performanceFee(currentEquity: number, highWaterMark: number, sched: FeeSchedule): number {
  if (currentEquity <= highWaterMark) return 0;
  const profit = currentEquity - highWaterMark;
  return profit * (sched.performanceBps / 10_000);
}

/** Management fee accrued over a fraction of a year. */
export function managementFee(aum: number, yearFraction: number, sched: FeeSchedule): number {
  if (aum < 0 || yearFraction < 0) throw new Error("NEGATIVE_INPUT");
  return aum * (sched.managementBps / 10_000) * yearFraction;
}
