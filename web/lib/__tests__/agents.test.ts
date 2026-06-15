import { describe, it, expect } from "vitest";
import { filterByStatus, statusCounts, allowedActions, type AgentSummary } from "../agents";

const agents: AgentSummary[] = [
  { id: "1", name: "alpha", status: "running", strategy: "momentum", cumulativePnl: 100, verified: true },
  { id: "2", name: "beta", status: "paused", strategy: "breakout", cumulativePnl: -20, verified: false },
  { id: "3", name: "gamma", status: "running", strategy: "regime-adaptive", cumulativePnl: 50, verified: true }
];

describe("filterByStatus", () => {
  it("all returns everything", () => expect(filterByStatus(agents, "all")).toHaveLength(3));
  it("filters running", () => expect(filterByStatus(agents, "running")).toHaveLength(2));
});
describe("statusCounts", () => {
  it("counts by status", () => {
    expect(statusCounts(agents)).toEqual({ total: 3, running: 2, paused: 1, halted: 0 });
  });
});
describe("allowedActions", () => {
  it("running can pause/stop", () => expect(allowedActions("running")).toEqual(["pause", "stop"]));
  it("paused can resume/stop", () => expect(allowedActions("paused")).toEqual(["resume", "stop"]));
  it("halted can only resume", () => expect(allowedActions("halted")).toEqual(["resume"]));
});
