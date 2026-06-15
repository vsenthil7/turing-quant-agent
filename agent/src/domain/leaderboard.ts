/** AI benchmark leaderboard — the verification surface that delivers the
 *  "verifiable on-chain AI performance" promise. Pure ranking + aggregation. */

export interface AgentRecord {
  agentId: string;
  tenantId: string;
  cumulativePnl: number;
  sharpe: number;
  hitRate: number;
  trades: number;
  reputation: number;
  verified: boolean; // backed by on-chain DecisionLog settlement
}

export interface RankedAgent extends AgentRecord { rank: number; }

/** Composite score: reputation-weighted, requires verification to rank high. */
export function score(a: AgentRecord): number {
  const base = a.sharpe * 0.4 + a.hitRate * 0.3 + Math.tanh(a.cumulativePnl / 1000) * 0.3;
  const verifiedMultiplier = a.verified ? 1 : 0.25; // unverified heavily discounted
  return base * verifiedMultiplier * (1 + Math.log10(a.reputation + 1));
}

/** Rank agents by composite score, descending. Stable on ties by agentId. */
export function rank(records: AgentRecord[]): RankedAgent[] {
  const sorted = [...records].sort((a, b) => {
    const d = score(b) - score(a);
    return d !== 0 ? d : a.agentId.localeCompare(b.agentId);
  });
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Filter to a single tenant's agents (multi-tenant leaderboard view). */
export function tenantBoard(records: AgentRecord[], tenantId: string): RankedAgent[] {
  return rank(records.filter(r => r.tenantId === tenantId));
}

/** Global verified-only board (the public benchmark). */
export function publicBoard(records: AgentRecord[]): RankedAgent[] {
  return rank(records.filter(r => r.verified));
}
