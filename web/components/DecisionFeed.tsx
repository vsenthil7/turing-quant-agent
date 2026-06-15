import React from "react";
import { DecisionRow, type DecisionRowProps } from "./DecisionRow";
import { EmptyState } from "./EmptyState";

export interface DecisionFeedProps { decisions: DecisionRowProps[]; }

export function DecisionFeed({ decisions }: DecisionFeedProps) {
  if (decisions.length === 0) return <EmptyState message="No decisions yet" />;
  return (
    <div className="decision-feed" role="list" aria-label="Decision feed">
      {decisions.map(d => <DecisionRow key={d.seq} {...d} />)}
    </div>
  );
}

/** Pure: summarize a feed for header display. */
export function feedSummary(decisions: DecisionRowProps[]): { total: number; longs: number; shorts: number; holds: number } {
  return {
    total: decisions.length,
    longs: decisions.filter(d => d.action === 1).length,
    shorts: decisions.filter(d => d.action === -1).length,
    holds: decisions.filter(d => d.action === 0).length
  };
}
