import React, { useState } from "react";
import { filterByStatus, statusCounts, allowedActions, type AgentSummary, type AgentStatus } from "../lib/agents";
import { money } from "../lib/format";
import { EmptyState } from "./EmptyState";

export interface AgentManagerProps {
  agents: AgentSummary[];
  canControl: boolean;
  onAction: (id: string, action: "pause" | "resume" | "stop") => void;
}

export function AgentManager({ agents, canControl, onAction }: AgentManagerProps) {
  const [filter, setFilter] = useState<AgentStatus | "all">("all");
  const counts = statusCounts(agents);
  const visible = filterByStatus(agents, filter);

  return (
    <section aria-label="Agent management">
      <header>
        <h2>Agents</h2>
        <span data-testid="counts">{counts.running} running · {counts.paused} paused · {counts.halted} halted</span>
      </header>
      <label>
        Status
        <select aria-label="status filter" value={filter} onChange={e => setFilter(e.target.value as AgentStatus | "all")}>
          <option value="all">All</option><option value="running">Running</option>
          <option value="paused">Paused</option><option value="halted">Halted</option>
        </select>
      </label>
      {visible.length === 0 ? <EmptyState message="No agents" /> : (
        <ul role="list" className="agent-list">
          {visible.map(a => (
            <li key={a.id} data-testid={`agent-${a.id}`} role="listitem">
              <span className="name">{a.name}</span>
              <span className={`status ${a.status}`}>{a.status}</span>
              <span className="strategy">{a.strategy}</span>
              <span className={a.cumulativePnl >= 0 ? "pos" : "neg"}>{money(a.cumulativePnl)}</span>
              {a.verified ? <span aria-label="verified">✓</span> : <span aria-label="unverified">—</span>}
              {canControl && allowedActions(a.status).map(action => (
                <button key={action} onClick={() => onAction(a.id, action)}>{action}</button>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
