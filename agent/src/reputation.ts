import type { ReplayStats } from "./replay.js";

/**
 * Map verified performance to an ERC-8004 reputation delta.
 * Reputation rewards profitable, accurate trading; never negative.
 * Score = max(0, round(cumulativePnl scaled + hitRate bonus)).
 */
export function reputationDelta(stats: ReplayStats): number {
  if (stats.trades === 0) return 0;
  const pnlComponent = stats.cumulativePnl; // already in PnL units
  const hitBonus = stats.hitRate * stats.trades * 10; // reward accuracy
  const raw = pnlComponent + hitBonus;
  return raw <= 0 ? 0 : Math.round(raw);
}
