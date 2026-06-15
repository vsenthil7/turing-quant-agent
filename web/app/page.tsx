"use client";
/** Agent dashboard. Uses pure dashboardState logic + extracted components.
 *  DESKTOP: set NEXT_PUBLIC_API_URL, run `next dev`. */
import { useEffect, useState } from "react";
import { ApiClient } from "../lib/apiClient";
import { money, pct, pnlClass } from "../lib/format";
import { emptyDashboard, applyPoll, applyError, deriveStats, healthStatus, type DashboardData } from "../lib/dashboardState";
import { StatCard } from "../components/StatCard";
import { StatusDot } from "../components/StatusDot";

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");
const fmt = { money, pct, pnlClass };

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);

  useEffect(() => {
    let live = true;
    const tick = async () => {
      try {
        const [state, health, config] = await Promise.all([api.state(), api.health(), api.config()]);
        if (live) setData(prev => applyPoll(prev, { state, health, config }));
      } catch (e) {
        if (live) setData(prev => applyError(prev, (e as Error).message));
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { live = false; clearInterval(id); };
  }, []);

  const stats = deriveStats(data, fmt);
  return (
    <main className="dash">
      <header>
        <h1>QUANT AGENT</h1>
        <StatusDot status={healthStatus(data)} />
        <span className="mode">{data.config?.aiMode ?? "—"} {data.config?.dryRun ? "· dry-run" : "· live"}</span>
      </header>
      {data.error && <div className="err" role="alert">connection: {data.error}</div>}
      <section className="grid">
        {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} tone={s.tone} />)}
      </section>
    </main>
  );
}
