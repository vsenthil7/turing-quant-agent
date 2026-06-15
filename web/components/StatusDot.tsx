import React from "react";

export type HealthStatus = "ok" | "degraded" | "down";
export interface StatusDotProps { status: HealthStatus; }

export function StatusDot({ status }: StatusDotProps) {
  const label = status === "ok" ? "Healthy" : status === "degraded" ? "Degraded" : "Down";
  return <span className={`dot ${status}`} role="status" aria-label={label} title={label} />;
}
