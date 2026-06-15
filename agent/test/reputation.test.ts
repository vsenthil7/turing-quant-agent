import { describe, it, expect } from "vitest";
import { reputationDelta } from "../src/reputation.js";

describe("reputationDelta", () => {
  it("zero when no trades", () => {
    expect(reputationDelta({ frames: 1, trades: 0, cumulativePnl: 0, hitRate: 0 })).toBe(0);
  });
  it("positive for profitable accurate trading", () => {
    const d = reputationDelta({ frames: 4, trades: 3, cumulativePnl: 6, hitRate: 2 / 3 });
    expect(d).toBeGreaterThan(0);
  });
  it("clamps to zero for net-losing performance", () => {
    const d = reputationDelta({ frames: 2, trades: 1, cumulativePnl: -100, hitRate: 0 });
    expect(d).toBe(0);
  });
});
