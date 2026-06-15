/** Pure agent-management view-model. */
export type AgentStatus = "running" | "paused" | "halted";
export interface AgentSummary {
  id: string;
  name: string;
  status: AgentStatus;
  strategy: string;
  cumulativePnl: number;
  verified: boolean;
}

/** Filter agents by status; "all" returns everything. */
export function filterByStatus(agents: AgentSummary[], status: AgentStatus | "all"): AgentSummary[] {
  return status === "all" ? agents : agents.filter(a => a.status === status);
}

/** Aggregate counts for the management header. */
export function statusCounts(agents: AgentSummary[]): Record<AgentStatus | "total", number> {
  return {
    total: agents.length,
    running: agents.filter(a => a.status === "running").length,
    paused: agents.filter(a => a.status === "paused").length,
    halted: agents.filter(a => a.status === "halted").length
  };
}

/** Whether an action is allowed for a given status (pause only if running, etc). */
export function allowedActions(status: AgentStatus): ("pause" | "resume" | "stop")[] {
  switch (status) {
    case "running": return ["pause", "stop"];
    case "paused": return ["resume", "stop"];
    case "halted": return ["resume"];
  }
}
