import { describe, it, expect } from "vitest";
import { checkExposure, checkCorrelation, killSwitch } from "../src/guardrails.js";

const limits = { maxGross: 1, maxNet: 0.5, maxCorrelation: 0.8, maxDrawdownPct: 0.2 };

describe("checkExposure", () => {
  it("ok within limits", () => {
    expect(checkExposure([{ asset: "X", weight: 0.3 }], limits).ok).toBe(true);
  });
  it("rejects gross breach", () => {
    const r = checkExposure([{ asset: "X", weight: 0.7 }, { asset: "Y", weight: -0.6 }], limits);
    expect(r.ok).toBe(false);
  });
  it("rejects net breach", () => {
    const r = checkExposure([{ asset: "X", weight: 0.6 }], limits);
    expect(r).toMatchObject({ ok: false, violation: "net" });
  });
});

describe("checkCorrelation", () => {
  it("ok when uncorrelated", () => {
    const r = checkCorrelation({ A: [1, 2, 3, 4], B: [1, 5, 2, 6] }, { ...limits, maxCorrelation: 0.8 });
    expect(r.ok).toBe(true);
  });
  it("rejects highly correlated pair", () => {
    const r = checkCorrelation({ A: [1, 2, 3], B: [1, 2, 3] }, limits);
    expect(r).toMatchObject({ ok: false, violation: "correlation" });
  });
});

describe("killSwitch", () => {
  it("ok below threshold", () => expect(killSwitch(0.1, limits).ok).toBe(true));
  it("trips at threshold", () => {
    expect(killSwitch(0.25, limits)).toMatchObject({ ok: false, violation: "drawdown" });
  });
});
