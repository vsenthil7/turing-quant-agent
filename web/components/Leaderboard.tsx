import React from "react";

export interface LeaderRow {
  rank: number;
  agentId: string;
  cumulativePnl: number;
  sharpe: number;
  hitRate: number;
  reputation: number;
  verified: boolean;
}

export interface LeaderboardProps { rows: LeaderRow[]; title?: string; }

export function Leaderboard({ rows, title = "Leaderboard" }: LeaderboardProps) {
  if (rows.length === 0) {
    return <div className="empty" role="note">No ranked agents yet</div>;
  }
  return (
    <table className="leaderboard" aria-label={title}>
      <thead>
        <tr><th>#</th><th>Agent</th><th>PnL</th><th>Sharpe</th><th>Hit%</th><th>Rep</th><th>Verified</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.agentId} data-testid={`leader-${r.rank}`}>
            <td>{r.rank}</td>
            <td>{r.agentId}</td>
            <td className={r.cumulativePnl >= 0 ? "pos" : "neg"}>{r.cumulativePnl.toFixed(0)}</td>
            <td>{r.sharpe.toFixed(2)}</td>
            <td>{(r.hitRate * 100).toFixed(0)}%</td>
            <td>{r.reputation}</td>
            <td>{r.verified ? <span aria-label="verified">✓</span> : <span aria-label="unverified">—</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
