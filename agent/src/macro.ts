import type { LlmClient } from "./types.js";

/** Market regime derived from macro/news context. */
export type Regime = "risk-on" | "risk-off" | "neutral";

export interface MacroView {
  regime: Regime;
  confidence: number; // 0..1
  rationale: string;
}

/** Parse + validate the LLM's macro assessment. Throws on malformed output. */
export function parseMacroView(raw: string): MacroView {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error("macro: invalid JSON");
  }
  if (typeof obj !== "object" || obj === null) {
    throw new Error("macro: not an object");
  }
  const o = obj as Record<string, unknown>;
  const regime = o["regime"];
  const confidence = o["confidence"];
  const rationale = o["rationale"];
  if (regime !== "risk-on" && regime !== "risk-off" && regime !== "neutral") {
    throw new Error("macro: bad regime");
  }
  if (typeof confidence !== "number" || !Number.isFinite(confidence) ||
      confidence < 0 || confidence > 1) {
    throw new Error("macro: bad confidence");
  }
  if (typeof rationale !== "string" || rationale.length === 0) {
    throw new Error("macro: bad rationale");
  }
  return { regime, confidence, rationale };
}

export async function assessMacro(llm: LlmClient, context: string): Promise<MacroView> {
  return parseMacroView(await llm.decide(context));
}

/**
 * Condition a technical action by macro regime.
 * - risk-off suppresses longs (->hold); shorts pass through.
 * - risk-on suppresses shorts (->hold); longs pass through.
 * - neutral passes through.
 * Confidence below `minConfidence` is treated as neutral (don't override on weak signal).
 */
export function conditionByRegime(
  action: -1 | 0 | 1,
  view: MacroView,
  minConfidence: number
): -1 | 0 | 1 {
  if (view.confidence < minConfidence || view.regime === "neutral") {
    return action;
  }
  if (view.regime === "risk-off" && action === 1) return 0;
  if (view.regime === "risk-on" && action === -1) return 0;
  return action;
}
