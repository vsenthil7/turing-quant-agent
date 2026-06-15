import { describe, it, expect, vi } from "vitest";
import { applyPolicy, type RuleProposal } from "../src/policy.js";

const rule: RuleProposal = { action: 1, size: 10 };
const llmLong = { decide: vi.fn(async () => '{"action":1,"size":5,"rationale":"agree"}') };
const llmHold = { decide: vi.fn(async () => '{"action":0,"size":0,"rationale":"too risky"}') };
const llmShort = { decide: vi.fn(async () => '{"action":-1,"size":8,"rationale":"reverse"}') };

describe("applyPolicy — driver", () => {
  it("LLM decision wins", async () => {
    const d = await applyPolicy("driver", rule, llmShort, "p");
    expect(d.action).toBe(-1);
    expect(d.size).toBe(8);
  });
});

describe("applyPolicy — advisor", () => {
  it("rule wins, LLM gives rationale", async () => {
    const d = await applyPolicy("advisor", rule, llmShort, "p");
    expect(d.action).toBe(1);   // rule
    expect(d.size).toBe(10);    // rule
    expect(d.rationale).toBe("reverse"); // llm
  });
});

describe("applyPolicy — gate", () => {
  it("LLM agrees -> rule action, min size", async () => {
    const d = await applyPolicy("gate", rule, llmLong, "p");
    expect(d.action).toBe(1);
    expect(d.size).toBe(5); // min(10,5)
  });
  it("LLM holds -> veto to hold", async () => {
    const d = await applyPolicy("gate", rule, llmHold, "p");
    expect(d.action).toBe(0);
    expect(d.size).toBe(0);
    expect(d.rationale).toContain("gated");
  });
});
