import { describe, it, expect } from "vitest";
import { rehydrate, shouldSnapshot, appendAndMaybeSnapshot, type EventStore } from "../src/persistence.js";
import { initialState, type DomainEvent, type AgentState } from "../src/events.js";

class MemEventStore implements EventStore {
  events: DomainEvent[] = [];
  snapshots: { seq: number; state: AgentState }[] = [];
  async append(e: DomainEvent) { this.events.push(e); }
  async load(fromSeq: number) { return this.events.slice(fromSeq); }
  async saveSnapshot(seq: number, state: AgentState) { this.snapshots.push({ seq, state }); }
  async latestSnapshot() { return this.snapshots.length ? this.snapshots[this.snapshots.length - 1]! : null; }
}

describe("shouldSnapshot", () => {
  it("true at interval", () => expect(shouldSnapshot(10, 10)).toBe(true));
  it("false below interval", () => expect(shouldSnapshot(3, 10)).toBe(false));
  it("throws on bad interval", () => expect(() => shouldSnapshot(1, 0)).toThrow(RangeError));
});

describe("rehydrate", () => {
  it("replays from scratch with no snapshot", async () => {
    const store = new MemEventStore();
    await store.append({ type: "SessionStarted", equity: 1000 });
    await store.append({ type: "TradeSettled", seq: 0, pnl: 50 });
    const s = await rehydrate(store);
    expect(s.equity).toBe(1050);
  });
  it("resumes from latest snapshot + later events", async () => {
    const store = new MemEventStore();
    await store.append({ type: "SessionStarted", equity: 1000 }); // seq 0
    await store.saveSnapshot(0, { ...initialState, equity: 1000, peakEquity: 1000 });
    await store.append({ type: "TradeSettled", seq: 1, pnl: 25 });  // seq 1
    const s = await rehydrate(store);
    expect(s.equity).toBe(1025);
  });
});

describe("appendAndMaybeSnapshot", () => {
  it("snapshots when policy triggers", async () => {
    const store = new MemEventStore();
    const r = await appendAndMaybeSnapshot(store, initialState, { type: "Resumed" }, 5, 9, 10);
    expect(r.snapshotted).toBe(true);
    expect(store.snapshots).toHaveLength(1);
  });
  it("skips snapshot below interval", async () => {
    const store = new MemEventStore();
    const r = await appendAndMaybeSnapshot(store, initialState, { type: "Resumed" }, 1, 0, 10);
    expect(r.snapshotted).toBe(false);
  });
});
