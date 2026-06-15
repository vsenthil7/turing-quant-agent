/** Sprint 5: mock adapters + factory parameterisation tests.
 *  Proves the system runs fully offline on mocks (default) and that the factory
 *  selects mock|live per env, failing loudly when live config is absent. */
import { describe, it, expect } from "vitest";
import {
  createMockChain, createMockLlm, createMockProvenance, createMockEventStore, createMockOracle
} from "../src/adapters/mocks.js";
import {
  resolveMode, makeChain, makeLlm, makeProvenance, makeEventStore, makeOracle, makeAdapters
} from "../src/adapters/factory.js";
import { anchor, verify } from "../src/provenance.js";
import { rehydrate } from "../src/persistence.js";
import type { DomainEvent } from "../src/events.js";

const mockOracleCfg = {
  maxStalenessSec: 60, maxDivergenceBps: 100, minSources: 2,
  quotes: [{ source: "a", price: 100 }, { source: "b", price: 100.5 }]
};

describe("mock chain", () => {
  it("records with incrementing ids and tracks executions", async () => {
    const chain = createMockChain();
    const id1 = await chain.record("0xsig", "0xrat", 1);
    const id2 = await chain.record("0xsig2", "0xrat2", -1);
    expect([id1, id2]).toEqual([1, 2]);
    await chain.execute(id1, 1, 500);
    expect(chain.records).toHaveLength(2);
    expect(chain.executions[0]).toEqual({ decisionId: 1, action: 1, size: 500 });
  });
});

describe("mock llm", () => {
  it("returns valid JSON; long/short/hold by score hint", async () => {
    const llm = createMockLlm();
    expect(JSON.parse(await llm.decide("score: 0.8")).action).toBe(1);
    expect(JSON.parse(await llm.decide("score=-0.5")).action).toBe(-1);
    expect(JSON.parse(await llm.decide("no hint")).action).toBe(0);
    const long = JSON.parse(await llm.decide("score: 0.8"));
    expect(long.size).toBe(1);
    expect(typeof long.rationale).toBe("string");
  });
});

describe("mock provenance", () => {
  it("anchors and verifies round-trip", async () => {
    const store = createMockProvenance();
    const rec = await anchor(store, "decision rationale text");
    expect(rec.cid).toMatch(/^bafymock/);
    expect(await verify(store, rec)).toBe(true);
  });
  it("rejects empty content and unknown cid", async () => {
    const store = createMockProvenance();
    await expect(store.put("")).rejects.toThrow(/empty/);
    await expect(store.get("nope")).rejects.toThrow(/unknown cid/);
  });
});

describe("mock event store", () => {
  it("supports rehydrate via snapshot + events", async () => {
    const store = createMockEventStore();
    const evs: DomainEvent[] = [
      { type: "SessionStarted", equity: 1000 },
      { type: "DecisionMade", seq: 1, action: 1, size: 1 },
      { type: "TradeSettled", seq: 2, pnl: 50 }
    ];
    for (const e of evs) await store.append(e);
    const state = await rehydrate(store);
    expect(state.equity).toBe(1050);
    expect(state.settledCount).toBe(1);
  });
  it("rehydrates from a saved snapshot forward", async () => {
    const store = createMockEventStore();
    await store.append({ type: "SessionStarted", equity: 1000 });
    await store.saveSnapshot(0, { equity: 1000, peakEquity: 1000, openDecisions: 0, settledCount: 0, cumulativePnl: 0, halted: false });
    await store.append({ type: "TradeSettled", seq: 1, pnl: 25 });
    const state = await rehydrate(store);
    expect(state.equity).toBe(1025);
  });
});

describe("mock oracle", () => {
  it("aggregates fixed quotes through the real guard", async () => {
    const oracle = createMockOracle(mockOracleCfg);
    const r = await oracle.getPrice(0);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.usedSources).toBe(2); expect(r.price).toBeCloseTo(100.25, 6); }
  });
});

describe("factory resolveMode", () => {
  it("defaults to mock", () => {
    expect(resolveMode({}, "TQA_CHAIN_MODE")).toBe("mock");
  });
  it("specific overrides global", () => {
    expect(resolveMode({ TQA_MODE: "live", TQA_CHAIN_MODE: "mock" }, "TQA_CHAIN_MODE")).toBe("mock");
  });
  it("falls back to global", () => {
    expect(resolveMode({ TQA_MODE: "live" }, "TQA_LLM_MODE")).toBe("live");
  });
  it("is case-insensitive", () => {
    expect(resolveMode({ TQA_MODE: "LIVE" }, "TQA_LLM_MODE")).toBe("live");
  });
  it("throws on invalid value", () => {
    expect(() => resolveMode({ TQA_MODE: "banana" }, "TQA_CHAIN_MODE")).toThrow(/expected mock\|live/);
  });
});

describe("factory selection (mock default)", () => {
  it("builds all mock adapters with no env and runs end-to-end", async () => {
    const a = makeAdapters({}, { mockOracle: mockOracleCfg });
    const id = await a.chain.record("0xs", "0xr", 1);
    expect(id).toBe(1);
    expect(JSON.parse(await a.llm.decide("score: 1")).action).toBe(1);
    const rec = await anchor(a.provenance, "x");
    expect(await verify(a.provenance, rec)).toBe(true);
    await a.eventStore.append({ type: "SessionStarted", equity: 1 });
    expect((await a.oracle.getPrice(0)).ok).toBe(true);
  });
  it("individual makers default to mock", async () => {
    expect(await makeChain({}).record("a", "b", 0)).toBe(1);
    expect(typeof (await makeLlm({}).decide("x"))).toBe("string");
    expect(await makeProvenance({}).put("y")).toMatch(/^bafymock/);
    const es = makeEventStore({});
    await es.append({ type: "Resumed" });
    expect(await es.load(0)).toHaveLength(1);
    expect((await makeOracle({}, { mockOracle: mockOracleCfg }).getPrice(0)).ok).toBe(true);
  });
});

describe("factory selection (live requires config)", () => {
  const live = { TQA_MODE: "live" };
  it("chain live without config throws", () => {
    expect(() => makeChain(live)).toThrow(/LIVE chain selected but no config/);
  });
  it("llm live without config throws", () => {
    expect(() => makeLlm(live)).toThrow(/LIVE llm/);
  });
  it("provenance live without config throws", () => {
    expect(() => makeProvenance(live)).toThrow(/LIVE provenance/);
  });
  it("eventStore live without config throws", () => {
    expect(() => makeEventStore(live)).toThrow(/LIVE eventStore/);
  });
  it("oracle live without config throws", () => {
    expect(() => makeOracle(live)).toThrow(/LIVE oracle/);
  });
  it("mock oracle without mockOracle config throws", () => {
    expect(() => makeOracle({})).toThrow(/LIVE mockOracle|mockOracle/);
  });
  it("live with config constructs the live adapter (not wired -> throws on use)", async () => {
    const chain = makeChain(live, {
      chain: { rpcUrl: "http://x", decisionLogAddress: "0x0", vaultAddress: "0x0", privateKey: "0x0" }
    });
    await expect(chain.record("a", "b", 1)).rejects.toThrow(/ADAPTER_NOT_WIRED/);
  });
});
