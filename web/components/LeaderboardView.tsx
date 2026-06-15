import React, { useState } from "react";
import { Leaderboard, type LeaderRow } from "./Leaderboard";
import { AsyncBoundary, type AsyncStatus } from "./AsyncBoundary";

export type SortKey = "rank" | "cumulativePnl" | "sharpe" | "reputation";

export function sortRows(rows: LeaderRow[], key: SortKey): LeaderRow[] {
  const dir = key === "rank" ? 1 : -1; // rank ascending; metrics descending
  return [...rows].sort((a, b) => (a[key] - b[key]) * dir);
}

export interface LeaderboardViewProps {
  status: AsyncStatus;
  error?: string;
  rows: LeaderRow[];
  currentAgentId?: string;
  onRetry?: () => void;
}

export function LeaderboardView({ status, error, rows, currentAgentId, onRetry }: LeaderboardViewProps) {
  const [sort, setSort] = useState<SortKey>("rank");
  const sorted = sortRows(rows, sort);
  return (
    <section aria-label="Leaderboard view">
      <div className="controls">
        <label>
          Sort by
          <select aria-label="sort by" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
            <option value="rank">Rank</option>
            <option value="cumulativePnl">PnL</option>
            <option value="sharpe">Sharpe</option>
            <option value="reputation">Reputation</option>
          </select>
        </label>
      </div>
      <AsyncBoundary status={status} error={error} isEmpty={rows.length === 0} emptyMessage="No ranked agents yet" onRetry={onRetry}>
        <Leaderboard rows={sorted} />
        {currentAgentId && sorted.some(r => r.agentId === currentAgentId) && (
          <p className="you" data-testid="your-rank">
            Your agent ranks #{sorted.find(r => r.agentId === currentAgentId)!.rank}
          </p>
        )}
      </AsyncBoundary>
    </section>
  );
}
