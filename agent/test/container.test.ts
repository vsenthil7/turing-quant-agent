import { describe, it, expect, vi } from "vitest";
import { Container, type Dependencies } from "../src/container.js";

function deps(): Dependencies {
  return {
    config: {
      aiMode: "gate",
      risk: { maxPositionSize: 100, maxDrawdownPct: 0.2 },
      signals: { fast: 2, slow: 4, weights: { maCross: 0.5, momentum: 0.5 } },
      dryRun: true
    },
    llm: { decide: vi.fn(async () => "{}") },
    chain: { record: vi.fn(async () => 0), execute: vi.fn(async () => {}) },
    eventStore: { append: vi.fn(), load: vi.fn(async () => []), saveSnapshot: vi.fn(), latestSnapshot: vi.fn(async () => null) },
    provenance: { put: vi.fn(async () => "cid"), get: vi.fn(async () => "") },
    logSink: { write: vi.fn() }
  };
}

describe("Container", () => {
  it("wires dependencies and exposes logger + metrics", () => {
    const c = new Container(deps(), () => 1);
    c.logger.info("hi");
    c.metrics.inc("x");
    expect(c.metrics.snapshot().counters.x).toBe(1);
  });
  it("describe reports config + wired deps", () => {
    const c = new Container(deps());
    const d = c.describe();
    expect(d.aiMode).toBe("gate");
    expect(d.dryRun).toBe(true);
    expect(d.wired).toContain("provenance");
  });
});
