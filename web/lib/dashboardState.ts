/** Pure dashboard data logic — extracted from the page so it's testable
 *  without React timing. The page component calls these. */
import type { AgentStateView, HealthView, ConfigView } from "./apiClient";

export interface DashboardData {
  state: AgentStateView | null;
  health: HealthView | null;
  config: ConfigView | null;
  error: string | null;
}

export const emptyDashboard: DashboardData = { state: null, health: null, config: null, error: null };

/** Merge a successful poll into dashboard data, clearing any prior error. */
export function applyPoll(
  prev: DashboardData,
  next: { state: AgentStateView; health: HealthView; config: ConfigView }
): DashboardData {
  return { state: next.state, health: next.health, config: next.config, error: null };
}

/** Apply a poll failure: keep last-good data, set error message. */
export function applyError(prev: DashboardData, message: string): DashboardData {
  return { ...prev, error: message };
}

/** Derive the six headline stat cards from state. Pure view-model. */
export interface StatVM { label: string; value: string; tone: "pos" | "neg" | "flat" }
export function deriveStats(
  data: DashboardData,
  fmt: { money: (n: number) => string; pct: (n: number) => string; pnlClass: (n: number) => "pos" | "neg" | "flat" }
): StatVM[] {
  const s = data.state?.state;
  const dd = data.state?.drawdown;
  return [
    { label: "Equity", value: s ? fmt.money(s.equity) : "—", tone: "flat" },
    { label: "Cumulative PnL", value: s ? fmt.money(s.cumulativePnl) : "—", tone: s ? fmt.pnlClass(s.cumulativePnl) : "flat" },
    { label: "Drawdown", value: dd !== undefined ? fmt.pct(dd) : "—", tone: "flat" },
    { label: "Settled", value: s ? String(s.settledCount) : "—", tone: "flat" },
    { label: "Open", value: s ? String(s.openDecisions) : "—", tone: "flat" },
    { label: "Status", value: s?.halted ? "HALTED" : s ? "RUNNING" : "—", tone: s?.halted ? "neg" : "pos" }
  ];
}

/** Health status for the dot, defaulting to "down" when unknown. */
export function healthStatus(data: DashboardData): "ok" | "degraded" | "down" {
  return data.health?.status ?? "down";
}
