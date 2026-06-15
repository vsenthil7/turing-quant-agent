import { describe, it, expect } from "vitest";
import { emptyDashboard, applyPoll, applyError, deriveStats, healthStatus } from "../dashboardState";
import { money, pct, pnlClass } from "../format";

const fmt = { money, pct, pnlClass };
const sampleState = { state: { equity: 1050, peakEquity: 1100, openDecisions: 2, settledCount: 12, cumulativePnl: 50, halted: false }, drawdown: 0.045 };
const sampleHealth = { status: "ok" as const, checks: {}, container: { aiMode: "gate", dryRun: true, wired: [] } };
const sampleConfig = { aiMode: "gate", risk: { maxPositionSize: 100, maxDrawdownPct: 0.2 }, signals: {}, dryRun: true };

describe("applyPoll", () => {
  it("populates all fields and clears error", () => {
    const withErr = applyError(emptyDashboard, "boom");
    const d = applyPoll(withErr, { state: sampleState, health: sampleHealth, config: sampleConfig });
    expect(d.state).toEqual(sampleState);
    expect(d.error).toBeNull();
  });
});

describe("applyError", () => {
  it("keeps last-good data, sets error", () => {
    const good = applyPoll(emptyDashboard, { state: sampleState, health: sampleHealth, config: sampleConfig });
    const d = applyError(good, "network down");
    expect(d.state).toEqual(sampleState); // last-good retained
    expect(d.error).toBe("network down");
  });
  it("on empty, leaves nulls but sets error", () => {
    const d = applyError(emptyDashboard, "x");
    expect(d.state).toBeNull();
    expect(d.error).toBe("x");
  });
});

describe("deriveStats", () => {
  it("renders placeholders when no data", () => {
    const stats = deriveStats(emptyDashboard, fmt);
    expect(stats).toHaveLength(6);
    expect(stats.every(s => s.value === "—")).toBe(true);
  });
  it("derives values + tones from state", () => {
    const d = applyPoll(emptyDashboard, { state: sampleState, health: sampleHealth, config: sampleConfig });
    const stats = deriveStats(d, fmt);
    expect(stats.find(s => s.label === "Cumulative PnL")!.tone).toBe("pos");
    expect(stats.find(s => s.label === "Status")!.value).toBe("RUNNING");
    expect(stats.find(s => s.label === "Drawdown")!.value).toBe("4.50%");
  });
  it("shows HALTED with neg tone when halted", () => {
    const halted = { ...sampleState, state: { ...sampleState.state, halted: true } };
    const d = applyPoll(emptyDashboard, { state: halted, health: sampleHealth, config: sampleConfig });
    const status = deriveStats(d, fmt).find(s => s.label === "Status")!;
    expect(status.value).toBe("HALTED");
    expect(status.tone).toBe("neg");
  });
  it("negative PnL gets neg tone", () => {
    const losing = { ...sampleState, state: { ...sampleState.state, cumulativePnl: -200 } };
    const d = applyPoll(emptyDashboard, { state: losing, health: sampleHealth, config: sampleConfig });
    expect(deriveStats(d, fmt).find(s => s.label === "Cumulative PnL")!.tone).toBe("neg");
  });
});

describe("healthStatus", () => {
  it("defaults to down when unknown", () => expect(healthStatus(emptyDashboard)).toBe("down"));
  it("reflects health when present", () => {
    const d = applyPoll(emptyDashboard, { state: sampleState, health: sampleHealth, config: sampleConfig });
    expect(healthStatus(d)).toBe("ok");
  });
});
