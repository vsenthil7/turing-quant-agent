import { describe, it, expect, vi } from "vitest";
import { Container, type Dependencies } from "../src/container.js";
import { handleHealth, handleState, handleMetrics, handleReplay, handleConfig } from "../src/api.js";
import type { DomainEvent } from "../src/events.js";

function makeContainer(events: DomainEvent[] = []): Container {
  const deps: Dependencies = {
    config: {
      aiMode: "driver",
      risk: { maxPositionSize: 100, maxDrawdownPct: 0.2 },
      signals: { fast: 2, slow: 4, weights: { maCross: 0.5, momentum: 0.5 } },
      dryRun: false
    },
    llm: { decide: vi.fn(async () => "{}") },
    chain: { record: vi.fn(async () => 0), execute: vi.fn(async () => {}) },
    eventStore: {
      append: vi.fn(), saveSnapshot: vi.fn(),
      load: vi.fn(async () => events),
      latestSnapshot: vi.fn(async () => null)
    },
    provenance: { put: vi.fn(async () => "cid"), get: vi.fn(async () => "") },
    logSink: { write: vi.fn() }
  };
  return new Container(deps);
}

describe("api handlers", () => {
  it("health returns 200 + container info", () => {
    const r = handleHealth(makeContainer());
    expect(r.status).toBe(200);
  });
  it("state rehydrates and reports drawdown", async () => {
    const r = await handleState(makeContainer([
      { type: "SessionStarted", equity: 1000 },
      { type: "TradeSettled", seq: 0, pnl: -100 }
    ]));
    expect(r.status).toBe(200);
    expect((r.body as any).state.equity).toBe(900);
    expect((r.body as any).drawdown).toBeCloseTo(0.1);
  });
  it("metrics returns snapshot", () => {
    expect(handleMetrics(makeContainer()).status).toBe(200);
  });
  it("config returns non-secret config", () => {
    const r = handleConfig(makeContainer());
    expect((r.body as any).aiMode).toBe("driver");
  });
  it("replay returns stats for valid session", () => {
    const r = handleReplay(makeContainer(), {
      id: "s", frames: [{ seq: 0, signalHash: "a", action: 1, size: 10, rationale: "r", pnl: 5 }]
    });
    expect(r.status).toBe(200);
    expect((r.body as any).trades).toBe(1);
  });
  it("replay rejects invalid body", () => {
    expect(handleReplay(makeContainer(), null).status).toBe(400);
    expect(handleReplay(makeContainer(), {}).status).toBe(400);
  });
  it("replay rejects malformed session", () => {
    const r = handleReplay(makeContainer(), { frames: [{ seq: 5, signalHash: "a", action: 1, size: 1, rationale: "r", pnl: 0 }] });
    expect(r.status).toBe(400);
  });
});
