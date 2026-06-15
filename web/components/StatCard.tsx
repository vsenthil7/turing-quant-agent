import React from "react";
import { pnlClass } from "../lib/format";

export interface StatCardProps {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "flat";
  testId?: string;
}

export function StatCard({ label, value, tone = "flat", testId }: StatCardProps) {
  return (
    <div className="card" data-testid={testId ?? `stat-${label}`} role="group" aria-label={label}>
      <span className="card-label">{label}</span>
      <span className={`card-value ${tone}`} aria-live="polite">{value}</span>
    </div>
  );
}

/** Pure helper: derive a StatCard tone from a numeric value. */
export function toneFor(value: number): "pos" | "neg" | "flat" {
  return pnlClass(value);
}
