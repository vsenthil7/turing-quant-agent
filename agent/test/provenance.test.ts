import { describe, it, expect } from "vitest";
import { contentHash, anchor, verify, type ProvenanceStore } from "../src/provenance.js";

class MemStore implements ProvenanceStore {
  private m = new Map<string, string>();
  private n = 0;
  async put(content: string) { const cid = `cid-${this.n++}`; this.m.set(cid, content); return cid; }
  async get(cid: string) { const v = this.m.get(cid); if (v === undefined) throw new Error("not found"); return v; }
}

describe("contentHash", () => {
  it("is deterministic", () => {
    expect(contentHash("hello")).toBe(contentHash("hello"));
  });
  it("differs for different content", () => {
    expect(contentHash("a")).not.toBe(contentHash("b"));
  });
});

describe("anchor + verify", () => {
  it("stores and verifies intact content", async () => {
    const store = new MemStore();
    const rec = await anchor(store, "rationale text");
    expect(rec.cid).toBeTruthy();
    expect(await verify(store, rec)).toBe(true);
  });
  it("fails verification on tampered hash", async () => {
    const store = new MemStore();
    const rec = await anchor(store, "rationale text");
    expect(await verify(store, { ...rec, hash: "0xdeadbeef" })).toBe(false);
  });
  it("throws on empty content", async () => {
    await expect(anchor(new MemStore(), "")).rejects.toThrow("empty");
  });
});
