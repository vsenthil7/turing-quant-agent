import { describe, it, expect } from "vitest";
import { signedAmount, runningBalance, filterTx, type Tx } from "../txHistory";

const txs: Tx[] = [
  { id: "1", type: "deposit", amount: 100, timestamp: 1 },
  { id: "2", type: "fee", amount: 5, timestamp: 2 },
  { id: "3", type: "pnl", amount: 20, timestamp: 3 },
  { id: "4", type: "withdraw", amount: 30, timestamp: 4 }
];

describe("signedAmount", () => {
  it("deposit/pnl positive", () => { expect(signedAmount(txs[0]!)).toBe(100); expect(signedAmount(txs[2]!)).toBe(20); });
  it("withdraw/fee negative", () => { expect(signedAmount(txs[1]!)).toBe(-5); expect(signedAmount(txs[3]!)).toBe(-30); });
});

describe("runningBalance", () => {
  it("accumulates chronologically", () => {
    const rows = runningBalance(txs);
    expect(rows.map(r => r.balance)).toEqual([100, 95, 115, 85]);
  });
  it("respects opening balance", () => {
    expect(runningBalance([txs[0]!], 50)[0]!.balance).toBe(150);
  });
});

describe("filterTx", () => {
  it("all returns everything", () => expect(filterTx(txs, "all")).toHaveLength(4));
  it("filters by type", () => expect(filterTx(txs, "deposit")).toHaveLength(1));
});
