/** Typed API client for the agent backend. COMPLETE logic — DESKTOP only sets
 *  baseUrl via env. Mirrors the pure handlers in agent/src/api.ts. */

export interface AgentStateView {
  state: { equity: number; peakEquity: number; openDecisions: number; settledCount: number; cumulativePnl: number; halted: boolean };
  drawdown: number;
}
export interface HealthView { status: "ok" | "degraded" | "down"; checks: Record<string, boolean>; container: { aiMode: string; dryRun: boolean; wired: string[] } }
export interface ConfigView { aiMode: string; risk: { maxPositionSize: number; maxDrawdownPct: number }; signals: unknown; dryRun: boolean }
export interface MetricsView { counters: Record<string, number>; gauges: Record<string, number> }

export class ApiClient {
  constructor(private baseUrl: string) {}
  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
    return res.json() as Promise<T>;
  }
  health() { return this.get<HealthView>("/health"); }
  state() { return this.get<AgentStateView>("/state"); }
  metrics() { return this.get<MetricsView>("/metrics"); }
  config() { return this.get<ConfigView>("/config"); }
}
