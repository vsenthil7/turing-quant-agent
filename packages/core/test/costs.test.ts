import { describe, it, expect } from "vitest";
import { tradeCost, fundingCost, netPnl } from "../src/costs.js";

const m = { feeBps: 5, slippageBps: 10, fundingBpsPerPeriod: 1 };

describe("tradeCost", () => {
  it("charges fee + slippage on notional", () => {
    expect(tradeCost(10000, m)).toBeCloseTo(10000 * 15 / 10000); // 15
  });
  it("throws on negative notional", () => expect(() => tradeCost(-1, m)).toThrow(RangeError));
});

describe("fundingCost", () => {
  it("accrues with periods", () => {
    expect(fundingCost(10000, 3, m)).toBeCloseTo(10000 * 1 / 10000 * 3); // 3
  });
  it("throws on negative inputs", () => expect(() => fundingCost(-1, 1, m)).toThrow(RangeError));
});

describe("netPnl", () => {
  it("subtracts all costs from gross", () => {
    // gross 100, notional 10000: entry 15 + exit 15 + funding(2 periods)=2 => 100-32=68
    expect(netPnl(100, 10000, 2, m)).toBeCloseTo(68);
  });
  it("can go negative when costs exceed gross", () => {
    expect(netPnl(5, 10000, 0, m)).toBeLessThan(0);
  });
});
