/** Alert rule evaluation. Pure. Produces alerts from metrics + thresholds. */

export type AlertSeverity = "info" | "warning" | "critical";
export interface Alert { rule: string; severity: AlertSeverity; message: string; }

export interface AlertInputs {
  drawdown: number;
  dailyLossPct: number;
  consecutiveLosses: number;
  llmErrorRate: number;
  oracleStale: boolean;
}

export interface AlertThresholds {
  drawdownWarn: number;
  drawdownCrit: number;
  dailyLossCrit: number;
  maxConsecutiveLosses: number;
  llmErrorWarn: number;
}

/** Evaluate all rules, returning triggered alerts (highest severity first). */
export function evaluateAlerts(i: AlertInputs, t: AlertThresholds): Alert[] {
  const alerts: Alert[] = [];
  if (i.drawdown >= t.drawdownCrit) alerts.push({ rule: "drawdown", severity: "critical", message: `drawdown ${(i.drawdown * 100).toFixed(1)}%` });
  else if (i.drawdown >= t.drawdownWarn) alerts.push({ rule: "drawdown", severity: "warning", message: `drawdown ${(i.drawdown * 100).toFixed(1)}%` });
  if (i.dailyLossPct >= t.dailyLossCrit) alerts.push({ rule: "daily-loss", severity: "critical", message: `daily loss ${(i.dailyLossPct * 100).toFixed(1)}%` });
  if (i.consecutiveLosses >= t.maxConsecutiveLosses) alerts.push({ rule: "losing-streak", severity: "warning", message: `${i.consecutiveLosses} consecutive losses` });
  if (i.llmErrorRate >= t.llmErrorWarn) alerts.push({ rule: "llm-errors", severity: "warning", message: `llm error rate ${(i.llmErrorRate * 100).toFixed(1)}%` });
  if (i.oracleStale) alerts.push({ rule: "oracle-stale", severity: "critical", message: "oracle feed stale" });
  const order = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}
