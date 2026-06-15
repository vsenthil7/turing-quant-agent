import type { Action, Decision, LlmClient } from "./types.js";
import { parseDecision } from "./parse.js";

/** Rules-engine proposal (deterministic, from signals). */
export interface RuleProposal {
  action: Action;
  size: number;
}

/**
 * Configurable AI policy. Combines a deterministic rule proposal with the LLM
 * according to mode:
 *  - driver:  LLM decides; rule proposal passed as context (LLM output wins).
 *  - gate:    rule proposal is the base; LLM may veto (->hold) or scale size.
 *  - advisor: rule proposal wins; LLM supplies rationale only.
 */
export async function applyPolicy(
  mode: "driver" | "gate" | "advisor",
  rule: RuleProposal,
  llm: LlmClient,
  prompt: string
): Promise<Decision> {
  if (mode === "driver") {
    return parseDecision(await llm.decide(prompt));
  }

  if (mode === "advisor") {
    const raw = await llm.decide(prompt);
    const advised = parseDecision(raw);
    return { action: rule.action, size: rule.size, rationale: advised.rationale };
  }

  // gate
  const raw = await llm.decide(prompt);
  const llmView = parseDecision(raw);
  if (llmView.action === 0) {
    return { action: 0, size: 0, rationale: `gated: ${llmView.rationale}` };
  }
  // LLM agrees direction -> allow rule action, scale by min(rule, llm) size
  const size = Math.min(rule.size, llmView.size);
  return { action: rule.action, size, rationale: llmView.rationale };
}
