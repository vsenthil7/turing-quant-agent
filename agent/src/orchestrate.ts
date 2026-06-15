import type { LlmClient, Chain, Decision } from "./types.js";
import { parseDecision } from "./parse.js";
import { evaluateRisk, type PortfolioState, type RiskLimits } from "@tqa/core";

export interface RunDeps {
  llm: LlmClient;
  chain: Chain;
  state: PortfolioState;
  limits: RiskLimits;
  signalHash: string;
  rationaleHash: string;
  dryRun: boolean;
}

export interface RunResult {
  decision: Decision;
  executed: boolean;
  decisionId: number | null;
  skippedReason?: string;
}

/** Full pipeline: LLM -> parse -> risk check -> record + execute (unless dry-run). */
export async function runOnce(deps: RunDeps, prompt: string): Promise<RunResult> {
  const raw = await deps.llm.decide(prompt);
  const decision = parseDecision(raw);

  if (decision.action === 0) {
    return { decision, executed: false, decisionId: null, skippedReason: "hold" };
  }

  const risk = evaluateRisk(deps.state, decision.size, deps.limits);
  if (!risk.allowed) {
    return { decision, executed: false, decisionId: null, skippedReason: `risk:${risk.reason}` };
  }

  if (deps.dryRun) {
    return { decision, executed: false, decisionId: null, skippedReason: "dry-run" };
  }

  const id = await deps.chain.record(deps.signalHash, deps.rationaleHash, decision.action);
  await deps.chain.execute(id, decision.action, decision.size);
  return { decision, executed: true, decisionId: id };
}
