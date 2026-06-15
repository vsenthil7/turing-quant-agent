import React from "react";

export interface DecisionRowProps {
  seq: number;
  action: -1 | 0 | 1;
  size: number;
  rationale: string;
  pnl?: number;
}

export function actionLabel(action: -1 | 0 | 1): string {
  return action === 1 ? "LONG" : action === -1 ? "SHORT" : "HOLD";
}

export function DecisionRow({ seq, action, size, rationale, pnl }: DecisionRowProps) {
  return (
    <div className="decision-row" data-testid={`decision-${seq}`} role="listitem"
         aria-label={`Decision ${seq}: ${actionLabel(action)} size ${size}`}>
      <span className="seq">#{seq}</span>
      <span className={`action a${action}`}>{actionLabel(action)}</span>
      <span className="size">{size}</span>
      <span className="rationale">{rationale}</span>
      {pnl !== undefined && <span className={`pnl ${pnl >= 0 ? "pos" : "neg"}`}>{pnl >= 0 ? "+" : ""}{pnl}</span>}
    </div>
  );
}
