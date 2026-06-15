import { describe, it, expect } from "vitest";
import { gradeReport, normalizeCurve, sparklinePoints, type PerfReport } from "../backtestView";

const strong: PerfReport = { totalReturn: 0.4, sharpe: 2.0, sortino: 2.5, maxDrawdown: 0.1, winRate: 0.6, streaks: { longestWin: 5, longestLoss: 2 } };
const weak: PerfReport = { totalReturn: -0.1, sharpe: 0.1, sortino: 0.1, maxDrawdown: 0.5, winRate: 0.3, streaks: { longestWin: 1, longestLoss: 6 } };

describe("gradeReport", () => {
  it("strong when high sharpe + low dd + positive", () => expect(gradeReport(strong)).toBe("strong"));
  it("moderate mid-range", () => expect(gradeReport({ ...strong, sharpe: 0.8, maxDrawdown: 0.3 })).toBe("moderate"));
  it("weak when losing", () => expect(gradeReport(weak)).toBe("weak"));
});

describe("normalizeCurve", () => {
  it("maps to 0..1", () => expect(normalizeCurve([100, 150, 200])).toEqual([0, 0.5, 1]));
  it("flat curve -> 0.5", () => expect(normalizeCurve([100, 100])).toEqual([0.5, 0.5]));
  it("empty -> empty", () => expect(normalizeCurve([])).toEqual([]));
});

describe("sparklinePoints", () => {
  it("builds polyline points", () => {
    const pts = sparklinePoints([0, 100], 100, 50);
    expect(pts).toContain("0.0,50.0"); // first point at bottom
    expect(pts).toContain("100.0,0.0"); // last at top
  });
  it("returns empty for <2 points", () => expect(sparklinePoints([5], 100, 50)).toBe(""));
});
