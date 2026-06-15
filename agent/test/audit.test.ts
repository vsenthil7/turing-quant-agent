import { describe, it, expect } from "vitest";
import { AuditTrail } from "../src/audit.js";

describe("AuditTrail", () => {
  it("records and filters by kind", () => {
    const a = new AuditTrail();
    a.record({ kind: "signal", seq: 0, score: 0.5 });
    a.record({ kind: "decision", seq: 0, action: 1, size: 10 });
    a.record({ kind: "executed", seq: 0, decisionId: 3 });
    expect(a.count()).toBe(3);
    expect(a.byKind("decision")).toHaveLength(1);
    expect(a.all()).toHaveLength(3);
  });
});
