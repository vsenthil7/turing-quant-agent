import { describe, it, expect } from "vitest";
import { reduce, replay, initialState, currentDrawdown, type DomainEvent } from "../src/events.js";

describe("reduce + replay", () => {
  it("reconstructs state from an event log", () => {
    const log: DomainEvent[] = [
      { type: "SessionStarted", equity: 1000 },
      { type: "DecisionMade", seq: 0, action: 1, size: 10 },
      { type: "TradeSettled", seq: 0, pnl: 50 },
      { type: "DecisionMade", seq: 1, action: -1, size: 5 },
      { type: "TradeSettled", seq: 1, pnl: -20 }
    ];
    const s = replay(log);
    expect(s.equity).toBe(1030);
    expect(s.peakEquity).toBe(1050);
    expect(s.settledCount).toBe(2);
    expect(s.cumulativePnl).toBe(30);
    expect(s.openDecisions).toBe(0);
  });
  it("hold decisions don't open positions", () => {
    const s = reduce({ ...initialState }, { type: "DecisionMade", seq: 0, action: 0, size: 0 });
    expect(s.openDecisions).toBe(0);
  });
  it("halt and resume toggle", () => {
    let s = reduce(initialState, { type: "Halted", reason: "dd" });
    expect(s.halted).toBe(true);
    s = reduce(s, { type: "Resumed" });
    expect(s.halted).toBe(false);
  });
  it("openDecisions floors at zero", () => {
    const s = reduce({ ...initialState }, { type: "TradeSettled", seq: 0, pnl: 10 });
    expect(s.openDecisions).toBe(0);
  });
});

describe("currentDrawdown", () => {
  it("zero with no peak", () => expect(currentDrawdown(initialState)).toBe(0));
  it("computes from reconstructed state", () => {
    const s = { ...initialState, peakEquity: 1000, equity: 800 };
    expect(currentDrawdown(s)).toBeCloseTo(0.2);
  });
});
