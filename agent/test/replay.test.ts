import { describe, it, expect } from "vitest";
import { validateSession, replayStats, type ReplaySession } from "../src/replay.js";

const session: ReplaySession = {
  id: "s1",
  frames: [
    { seq: 0, signalHash: "a", action: 1, size: 10, rationale: "long", pnl: 5 },
    { seq: 1, signalHash: "b", action: 0, size: 0, rationale: "hold", pnl: 0 },
    { seq: 2, signalHash: "c", action: -1, size: 8, rationale: "short", pnl: -2 },
    { seq: 3, signalHash: "d", action: 1, size: 5, rationale: "long", pnl: 3 }
  ]
};

describe("validateSession", () => {
  it("accepts a sequential session", () => {
    expect(() => validateSession(session)).not.toThrow();
  });
  it("rejects empty id", () => {
    expect(() => validateSession({ id: "", frames: [] })).toThrow("empty id");
  });
  it("rejects out-of-order seq", () => {
    const bad = { id: "x", frames: [{ seq: 1, signalHash: "a", action: 0 as const, size: 0, rationale: "r", pnl: 0 }] };
    expect(() => validateSession(bad)).toThrow("seq");
  });
});

describe("replayStats", () => {
  it("is deterministic", () => {
    expect(replayStats(session)).toEqual(replayStats(session));
  });
  it("computes trades, pnl, hit rate", () => {
    const r = replayStats(session);
    expect(r.frames).toBe(4);
    expect(r.trades).toBe(3);          // 2 longs + 1 short, hold excluded
    expect(r.cumulativePnl).toBe(6);   // 5 + 0 - 2 + 3
    expect(r.hitRate).toBeCloseTo(2 / 3); // 2 wins of 3 trades
  });
  it("hit rate 0 when no trades", () => {
    const r = replayStats({ id: "z", frames: [{ seq: 0, signalHash: "a", action: 0, size: 0, rationale: "h", pnl: 0 }] });
    expect(r.hitRate).toBe(0);
    expect(r.trades).toBe(0);
  });
});
