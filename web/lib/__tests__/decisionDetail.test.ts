import { describe, it, expect } from "vitest";
import { actionWord, statusLabel, explorerUrl, shortHash, type DecisionDetail } from "../decisionDetail";

const base: DecisionDetail = { seq: 1, action: 1, size: 10, signalHash: "0xabc", rationaleHash: "0xdef", settled: false };

describe("actionWord", () => {
  it("maps actions", () => { expect(actionWord(1)).toBe("LONG"); expect(actionWord(-1)).toBe("SHORT"); expect(actionWord(0)).toBe("HOLD"); });
});
describe("statusLabel", () => {
  it("pending when no tx", () => expect(statusLabel(base)).toBe("pending"));
  it("open when tx but unsettled", () => expect(statusLabel({ ...base, txHash: "0x1" })).toBe("open"));
  it("settled when settled", () => expect(statusLabel({ ...base, settled: true })).toBe("settled"));
});
describe("explorerUrl", () => {
  it("builds url, trims trailing slash", () => {
    expect(explorerUrl("https://explorer.x/", "0xhash")).toBe("https://explorer.x/tx/0xhash");
  });
});
describe("shortHash", () => {
  it("shortens long hashes", () => expect(shortHash("0x1234567890abcdef")).toBe("0x1234…cdef"));
  it("leaves short ones", () => expect(shortHash("0xabc")).toBe("0xabc"));
});
