/** Portfolio-level risk guardrails + kill-switch. Pure. */
import { exposure, correlation, type Allocation } from "./portfolio.js";

export interface GuardrailLimits {
  maxGross: number;        // max sum |weight|
  maxNet: number;          // max |sum weight|
  maxCorrelation: number;  // reject pairs above this
  maxDrawdownPct: number;  // kill-switch threshold
}

export type GuardrailResult =
  | { ok: true }
  | { ok: false; violation: "gross" | "net" | "correlation" | "drawdown"; detail: string };

/** Check an allocation against gross/net exposure limits. */
export function checkExposure(alloc: Allocation[], limits: GuardrailLimits): GuardrailResult {
  const e = exposure(alloc);
  if (e.gross > limits.maxGross) return { ok: false, violation: "gross", detail: `gross ${e.gross.toFixed(3)}` };
  if (Math.abs(e.net) > limits.maxNet) return { ok: false, violation: "net", detail: `net ${e.net.toFixed(3)}` };
  return { ok: true };
}

/** Reject if any asset pair is too correlated (concentration risk). */
export function checkCorrelation(
  series: Record<string, number[]>,
  limits: GuardrailLimits
): GuardrailResult {
  const assets = Object.keys(series);
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const c = correlation(series[assets[i]!]!, series[assets[j]!]!);
      if (Math.abs(c) > limits.maxCorrelation) {
        return { ok: false, violation: "correlation", detail: `${assets[i]}/${assets[j]}=${c.toFixed(2)}` };
      }
    }
  }
  return { ok: true };
}

/** Kill-switch: halts trading when drawdown breaches threshold. */
export function killSwitch(currentDrawdown: number, limits: GuardrailLimits): GuardrailResult {
  if (currentDrawdown >= limits.maxDrawdownPct) {
    return { ok: false, violation: "drawdown", detail: `dd ${(currentDrawdown * 100).toFixed(1)}%` };
  }
  return { ok: true };
}
