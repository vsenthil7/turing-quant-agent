import type { Decision, Action } from "./types.js";

/** Parse + validate the LLM's JSON decision. Throws on anything malformed. */
export function parseDecision(raw: string): Decision {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error("llm: invalid JSON");
  }
  if (typeof obj !== "object" || obj === null) {
    throw new Error("llm: not an object");
  }
  const o = obj as Record<string, unknown>;
  const action = o["action"];
  const size = o["size"];
  const rationale = o["rationale"];
  if (action !== -1 && action !== 0 && action !== 1) {
    throw new Error("llm: bad action");
  }
  if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
    throw new Error("llm: bad size");
  }
  if (typeof rationale !== "string" || rationale.length === 0) {
    throw new Error("llm: bad rationale");
  }
  return { action: action as Action, size, rationale };
}
