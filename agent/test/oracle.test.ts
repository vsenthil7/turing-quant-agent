import { describe, it, expect } from "vitest";
import { aggregatePrice, type PriceQuote } from "../src/oracle.js";

const cfg = { maxStalenessSec: 60, maxDivergenceBps: 100, minSources: 2 };
const now = 1000;

describe("aggregatePrice", () => {
  it("returns median of fresh agreeing sources", () => {
    const q: PriceQuote[] = [
      { source: "a", price: 100, timestamp: 990 },
      { source: "b", price: 100.5, timestamp: 990 },
      { source: "c", price: 101, timestamp: 990 }
    ];
    const r = aggregatePrice(q, now, cfg);
    expect(r).toMatchObject({ ok: true, usedSources: 3 });
    if (r.ok) expect(r.price).toBeCloseTo(100.5);
  });
  it("averages two middle values for even count", () => {
    const q: PriceQuote[] = [
      { source: "a", price: 100, timestamp: 990 },
      { source: "b", price: 100.4, timestamp: 990 }
    ];
    const r = aggregatePrice(q, now, cfg);
    if (r.ok) expect(r.price).toBeCloseTo(100.2);
  });
  it("rejects when all stale", () => {
    const q: PriceQuote[] = [{ source: "a", price: 100, timestamp: 100 }];
    expect(aggregatePrice(q, now, cfg)).toMatchObject({ ok: false, reason: "stale" });
  });
  it("rejects when too few fresh sources", () => {
    const q: PriceQuote[] = [
      { source: "a", price: 100, timestamp: 990 },
      { source: "b", price: 100, timestamp: 100 }
    ];
    expect(aggregatePrice(q, now, cfg)).toMatchObject({ ok: false, reason: "insufficient" });
  });
  it("rejects divergent sources", () => {
    const q: PriceQuote[] = [
      { source: "a", price: 100, timestamp: 990 },
      { source: "b", price: 110, timestamp: 990 }
    ];
    expect(aggregatePrice(q, now, cfg)).toMatchObject({ ok: false, reason: "divergent" });
  });
  it("ignores non-positive prices", () => {
    const q: PriceQuote[] = [
      { source: "a", price: 0, timestamp: 990 },
      { source: "b", price: 100, timestamp: 990 }
    ];
    // only 1 fresh valid -> insufficient
    expect(aggregatePrice(q, now, cfg)).toMatchObject({ ok: false, reason: "insufficient" });
  });
});
