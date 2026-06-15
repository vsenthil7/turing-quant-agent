import { describe, it, expect, vi } from "vitest";
import { runOnce, type RunDeps } from "../src/orchestrate.js";

function deps(over: Partial<RunDeps> = {}): RunDeps {
  return {
    llm: { decide: vi.fn(async () => '{"action":1,"size":10,"rationale":"go"}') },
    chain: { record: vi.fn(async () => 7), execute: vi.fn(async () => {}) },
    state: { equity: 1000, peakEquity: 1000, openPosition: 0 },
    limits: { maxPositionSize: 100, maxDrawdownPct: 0.2 },
    signalHash: "0xsig",
    rationaleHash: "0xwhy",
    dryRun: false,
    ...over
  };
}

describe("runOnce — happy", () => {
  it("records + executes a valid long", async () => {
    const d = deps();
    const r = await runOnce(d, "prompt");
    expect(r.executed).toBe(true);
    expect(r.decisionId).toBe(7);
    expect(d.chain.record).toHaveBeenCalledOnce();
    expect(d.chain.execute).toHaveBeenCalledWith(7, 1, 10);
  });
});

describe("runOnce — skips", () => {
  it("skips on hold", async () => {
    const d = deps({ llm: { decide: vi.fn(async () => '{"action":0,"size":0,"rationale":"flat"}') } });
    const r = await runOnce(d, "p");
    expect(r.executed).toBe(false);
    expect(r.skippedReason).toBe("hold");
  });
  it("skips on risk rejection", async () => {
    const d = deps({ llm: { decide: vi.fn(async () => '{"action":1,"size":999,"rationale":"big"}') } });
    const r = await runOnce(d, "p");
    expect(r.executed).toBe(false);
    expect(r.skippedReason).toBe("risk:position");
  });
  it("skips on dry-run", async () => {
    const d = deps({ dryRun: true });
    const r = await runOnce(d, "p");
    expect(r.executed).toBe(false);
    expect(r.skippedReason).toBe("dry-run");
    expect(d.chain.record).not.toHaveBeenCalled();
  });
});

describe("runOnce — negative", () => {
  it("propagates malformed LLM output", async () => {
    const d = deps({ llm: { decide: vi.fn(async () => "garbage") } });
    await expect(runOnce(d, "p")).rejects.toThrow("invalid JSON");
  });
  it("propagates chain execute failure", async () => {
    const d = deps({ chain: { record: vi.fn(async () => 1), execute: vi.fn(async () => { throw new Error("tx reverted"); }) } });
    await expect(runOnce(d, "p")).rejects.toThrow("tx reverted");
  });
});
