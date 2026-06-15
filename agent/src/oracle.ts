/** Price oracle abstraction. Implementations (Mantle DEX TWAP, Chainlink,
 *  Pyth) wired in Desktop; here we define the contract + a guarded aggregator
 *  that defends against stale/divergent feeds. Pure logic over injected data. */

export interface PriceQuote {
  source: string;
  price: number;
  timestamp: number; // unix seconds
}

export interface OracleConfig {
  maxStalenessSec: number;   // reject quotes older than this
  maxDivergenceBps: number;  // reject if sources disagree beyond this
  minSources: number;        // require at least this many fresh sources
}

export type OracleResult =
  | { ok: true; price: number; usedSources: number }
  | { ok: false; reason: "stale" | "divergent" | "insufficient" };

/** Aggregate multiple price quotes into one trusted median, with guards. */
export function aggregatePrice(quotes: PriceQuote[], now: number, cfg: OracleConfig): OracleResult {
  const fresh = quotes.filter(q => now - q.timestamp <= cfg.maxStalenessSec && q.price > 0);
  if (fresh.length < cfg.minSources) {
    return { ok: false, reason: fresh.length === 0 ? "stale" : "insufficient" };
  }
  const prices = fresh.map(q => q.price).sort((a, b) => a - b);
  const median = prices.length % 2 === 1
    ? prices[(prices.length - 1) / 2]!
    : (prices[prices.length / 2 - 1]! + prices[prices.length / 2]!) / 2;
  const min = prices[0]!, max = prices[prices.length - 1]!;
  const divergenceBps = ((max - min) / median) * 10_000;
  if (divergenceBps > cfg.maxDivergenceBps) {
    return { ok: false, reason: "divergent" };
  }
  return { ok: true, price: median, usedSources: fresh.length };
}
