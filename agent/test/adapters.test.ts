import { describe, it, expect } from "vitest";
import { createViemChain } from "../src/adapters/viemChain.js";
import { createMantleOracle } from "../src/adapters/mantleOracle.js";
import { createIpfsProvenance } from "../src/adapters/ipfsProvenance.js";
import { createSqliteEventStore } from "../src/adapters/sqliteEventStore.js";
import { createOpenAiLlm } from "../src/adapters/openaiLlm.js";

// These verify adapter SHAPE + that unwired calls fail loudly with a clear
// marker, so Desktop knows exactly which call to fill. Logic that doesn't need
// the live endpoint (oracle aggregation, ipfs empty-guard) is exercised for real.

describe("adapter construction + clear unwired errors", () => {
  it("viemChain constructs; record/execute report unwired", async () => {
    const c = createViemChain({ rpcUrl: "x", decisionLogAddress: "0x0", vaultAddress: "0x0", privateKey: "0x0" });
    await expect(c.record("a", "b", 1)).rejects.toThrow("ADAPTER_NOT_WIRED");
    await expect(c.execute(0, 1, 10)).rejects.toThrow("ADAPTER_NOT_WIRED");
  });

  it("mantleOracle returns insufficient when no quotes fetched yet (guard works)", async () => {
    const o = createMantleOracle({ rpcUrl: "x", pools: [], maxStalenessSec: 60, maxDivergenceBps: 100, minSources: 2 });
    const r = await o.getPrice(1000);
    expect(r.ok).toBe(false); // no quotes -> guard rejects, aggregation logic is live
  });

  it("ipfsProvenance enforces empty-content guard before any network call", async () => {
    const p = createIpfsProvenance({ apiUrl: "x", gatewayUrl: "y" });
    await expect(p.put("")).rejects.toThrow("empty content");
    await expect(p.put("real")).rejects.toThrow("ADAPTER_NOT_WIRED");
  });

  it("sqliteEventStore constructs; ops report unwired", async () => {
    const s = createSqliteEventStore({ dbPath: ":memory:" });
    await expect(s.append({ type: "Resumed" })).rejects.toThrow("ADAPTER_NOT_WIRED");
    await expect(s.load(0)).rejects.toThrow("ADAPTER_NOT_WIRED");
    await expect(s.latestSnapshot()).rejects.toThrow("ADAPTER_NOT_WIRED");
  });

  it("openaiLlm constructs; decide reports unwired", async () => {
    const l = createOpenAiLlm({ apiUrl: "x", apiKey: "k", model: "m" });
    await expect(l.decide("p")).rejects.toThrow("ADAPTER_NOT_WIRED");
  });
});
