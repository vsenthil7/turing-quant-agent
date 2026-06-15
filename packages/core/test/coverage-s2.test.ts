/** Sprint 2 coverage-closing tests: target uncovered branches to reach 100%.
 *  Covers negative/edge paths across alerts, auditExport, backtest2, orders,
 *  position, rebalance, strategies-extra. */
import { describe, it, expect } from "vitest";
import { evaluateAlerts, type AlertInputs, type AlertThresholds } from "../src/alerts.js";
import { toCsv, toStableJson } from "../src/auditExport.js";
import { backtest2 } from "../src/backtest2.js";
import { validateOrder, shouldTrigger } from "../src/orders.js";
import { openPosition, closePosition, unrealizedPnl, transition } from "../src/position.js";
import { rebalance, turnover } from "../src/rebalance.js";
import { momentumStrategy, breakoutStrategy, meanReversionStrategy } from "../src/strategies-extra.js";
import type { CostModel } from "../src/costs.js";

const NO_COST: CostModel = { feeBps: 0, slippageBps: 0, fundingBpsPerPeriod: 0 };

const TH: AlertThresholds = {
  drawdownWarn: 0.05, drawdownCrit: 0.2, dailyLossCrit: 0.1,
  maxConsecutiveLosses: 3, llmErrorWarn: 0.25
};
const baseInputs: AlertInputs = {
  drawdown: 0, dailyLossPct: 0, consecutiveLosses: 0, llmErrorRate: 0, oracleStale: false
};

describe("alerts — every rule branch", () => {
  it("no alerts when all below thresholds", () => {
    expect(evaluateAlerts(baseInputs, TH)).toEqual([]);
  });
  it("warning drawdown (>=warn, <crit)", () => {
    const a = evaluateAlerts({ ...baseInputs, drawdown: 0.1 }, TH);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ rule: "drawdown", severity: "warning" });
  });
  it("critical drawdown wins over warning", () => {
    const a = evaluateAlerts({ ...baseInputs, drawdown: 0.25 }, TH);
    expect(a[0]).toMatchObject({ rule: "drawdown", severity: "critical" });
  });
  it("daily-loss critical", () => {
    const a = evaluateAlerts({ ...baseInputs, dailyLossPct: 0.15 }, TH);
    expect(a.some(x => x.rule === "daily-loss" && x.severity === "critical")).toBe(true);
  });
  it("losing-streak warning", () => {
    const a = evaluateAlerts({ ...baseInputs, consecutiveLosses: 3 }, TH);
    expect(a.some(x => x.rule === "losing-streak")).toBe(true);
  });
  it("llm-errors warning", () => {
    const a = evaluateAlerts({ ...baseInputs, llmErrorRate: 0.3 }, TH);
    expect(a.some(x => x.rule === "llm-errors")).toBe(true);
  });
  it("oracle-stale critical", () => {
    const a = evaluateAlerts({ ...baseInputs, oracleStale: true }, TH);
    expect(a.some(x => x.rule === "oracle-stale" && x.severity === "critical")).toBe(true);
  });
  it("sorts critical before warning when multiple fire", () => {
    const a = evaluateAlerts(
      { drawdown: 0.1, dailyLossPct: 0.15, consecutiveLosses: 3, llmErrorRate: 0.3, oracleStale: true },
      TH
    );
    expect(a[0]!.severity).toBe("critical");
    expect(a[a.length - 1]!.severity).toBe("warning");
  });
});

describe("auditExport — quoting + empty + stable json", () => {
  it("empty rows -> empty string", () => {
    expect(toCsv([])).toBe("");
  });
  it("quotes cells containing comma, quote, or newline", () => {
    const csv = toCsv([{ a: 'x,y', b: 'he said "hi"', c: "line1\nline2" }]);
    expect(csv).toContain('"x,y"');
    expect(csv).toContain('"he said ""hi"""');
    expect(csv).toContain('"line1\nline2"');
  });
  it("plain cells unquoted; columns sorted", () => {
    const csv = toCsv([{ b: 2, a: 1 }]);
    expect(csv.split("\n")[0]).toBe("a,b");
  });
  it("stable json sorts keys", () => {
    expect(toStableJson([{ b: 1, a: 2 }])).toBe('[{"a":2,"b":1}]');
  });
  it("emits empty cell when a later row is missing a column", () => {
    // columns are derived from row[0]; row[1] lacks 'b' -> csvCell(undefined) -> ''
    const csv = toCsv([{ a: 1, b: 2 }, { a: 3 } as any]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("a,b");
    expect(lines[2]).toBe("3,");
  });
});

describe("orders — validation negatives + trigger sides", () => {
  it("rejects non-positive size", () => {
    expect(() => validateOrder({ kind: "market", side: "buy", size: 0 })).toThrow(/size/);
  });
  it("limit requires positive price", () => {
    expect(() => validateOrder({ kind: "limit", side: "buy", size: 1 })).toThrow("LIMIT_REQUIRES_PRICE");
  });
  it("stop requires positive price", () => {
    expect(() => validateOrder({ kind: "stop", side: "sell", size: 1 })).toThrow("STOP_REQUIRES_PRICE");
    expect(() => validateOrder({ kind: "stop", side: "sell", size: 1, stopPrice: 0 })).toThrow("STOP_REQUIRES_PRICE");
  });
  it("market always triggers", () => {
    expect(shouldTrigger({ kind: "market", side: "buy", size: 1 }, 100)).toBe(true);
  });
  it("limit buy/sell fill conditions", () => {
    expect(shouldTrigger({ kind: "limit", side: "buy", size: 1, limitPrice: 100 }, 99)).toBe(true);
    expect(shouldTrigger({ kind: "limit", side: "buy", size: 1, limitPrice: 100 }, 101)).toBe(false);
    expect(shouldTrigger({ kind: "limit", side: "sell", size: 1, limitPrice: 100 }, 101)).toBe(true);
  });
  it("stop buy/sell trigger conditions", () => {
    expect(shouldTrigger({ kind: "stop", side: "buy", size: 1, stopPrice: 100 }, 101)).toBe(true);
    expect(shouldTrigger({ kind: "stop", side: "sell", size: 1, stopPrice: 100 }, 99)).toBe(true);
  });
});

describe("position — guards + lifecycle branches", () => {
  it("openPosition rejects bad size/price", () => {
    expect(() => openPosition("long", 0, 100)).toThrow(/size/);
    expect(() => openPosition("long", 1, 0)).toThrow(/entryPrice/);
  });
  it("unrealizedPnl is 0 when closed, signed when open", () => {
    const p = openPosition("long", 2, 100);
    expect(unrealizedPnl(p, 110)).toBe(20);
    const short = openPosition("short", 2, 100);
    expect(unrealizedPnl(short, 90)).toBe(20);
    expect(unrealizedPnl({ ...p, open: false }, 110)).toBe(0);
  });
  it("closePosition guards: already closed + bad exit", () => {
    const p = openPosition("long", 1, 100);
    const { closed } = closePosition(p, 110);
    expect(() => closePosition(closed, 120)).toThrow("ALREADY_CLOSED");
    expect(() => closePosition(p, 0)).toThrow(/exitPrice/);
  });
  it("transition: hold with no position is flat", () => {
    expect(transition(null, 0, 1, 100)).toEqual({ position: null, realizedPnl: 0 });
  });
  it("transition: hold closes open position", () => {
    const open = openPosition("long", 1, 100);
    const r = transition(open, 0, 1, 110);
    expect(r.position!.open).toBe(false);
    expect(r.realizedPnl).toBe(10);
  });
  it("transition: same side holds", () => {
    const open = openPosition("long", 1, 100);
    expect(transition(open, 1, 1, 105).position).toBe(open);
  });
  it("transition: flip closes and reopens opposite", () => {
    const open = openPosition("long", 1, 100);
    const r = transition(open, -1, 1, 110);
    expect(r.realizedPnl).toBe(10);
    expect(r.position!.side).toBe("short");
  });
  it("transition: opens from flat/closed", () => {
    expect(transition(null, 1, 1, 100).position!.side).toBe("long");
  });
});

describe("rebalance — fallback + sell side + turnover", () => {
  it("buy when asset only in target; sell when only in current", () => {
    const orders = rebalance([{ asset: "B", weight: 0.5 }], [{ asset: "A", weight: 0.5 }]);
    const a = orders.find(o => o.asset === "A");
    const b = orders.find(o => o.asset === "B");
    expect(a).toMatchObject({ side: "buy" });
    expect(b).toMatchObject({ side: "sell" });
  });
  it("ignores dust", () => {
    expect(rebalance([{ asset: "A", weight: 0.5 }], [{ asset: "A", weight: 0.5005 }])).toEqual([]);
  });
  it("turnover sums abs deltas", () => {
    const orders = rebalance([{ asset: "A", weight: 0.2 }], [{ asset: "A", weight: 0.5 }]);
    expect(turnover(orders)).toBeCloseTo(0.3, 6);
  });
});

describe("strategies-extra — all action branches", () => {
  const ctxRising = { closes: Array.from({ length: 30 }, (_, i) => 100 + i), fast: 3, slow: 10, threshold: 0 };
  it("momentum long on strong uptrend, defined action in mid-band", () => {
    expect(momentumStrategy().evaluate(ctxRising).action).toBe(1);
    const flat = { ...ctxRising, closes: Array.from({ length: 30 }, (_, i) => 100 + (i % 2)) };
    expect([-1, 0, 1]).toContain(momentumStrategy().evaluate(flat).action);
  });
  it("breakout long/short/flat branches", () => {
    const up = { ...ctxRising, closes: [...Array(21).fill(100), 130] };
    expect(breakoutStrategy(20).evaluate(up).action).toBe(1);
    const down = { ...ctxRising, closes: [...Array(21).fill(100), 70] };
    expect(breakoutStrategy(20).evaluate(down).action).toBe(-1);
    const flat = { ...ctxRising, closes: [...Array(21).fill(100), 100] };
    expect(breakoutStrategy(20).evaluate(flat).action).toBe(0);
  });
  it("breakout throws on insufficient data", () => {
    expect(() => breakoutStrategy(20).evaluate({ ...ctxRising, closes: [1, 2, 3] })).toThrow(/not enough/);
  });
  it("mean-reversion long below band, short above, flat inside", () => {
    const below = { ...ctxRising, closes: [...Array(25).fill(100), 90] };
    expect(meanReversionStrategy(20, 0.02).evaluate(below).action).toBe(1);
    const above = { ...ctxRising, closes: [...Array(25).fill(100), 110] };
    expect(meanReversionStrategy(20, 0.02).evaluate(above).action).toBe(-1);
    const inside = { ...ctxRising, closes: [...Array(25).fill(100), 100] };
    expect(meanReversionStrategy(20, 0.02).evaluate(inside).action).toBe(0);
  });
});

describe("backtest2 — mark-to-market held branch + guards", () => {
  it("throws when warmup < slow", () => {
    expect(() => backtest2({
      closes: [1, 2, 3], strategy: momentumStrategy(), fast: 2, slow: 5,
      threshold: 0, notional: 1000, costs: NO_COST, warmup: 2
    })).toThrow(/warmup/);
  });
  it("throws when not enough data after warmup", () => {
    expect(() => backtest2({
      closes: Array(6).fill(100), strategy: momentumStrategy(), fast: 2, slow: 5,
      threshold: 0, notional: 1000, costs: NO_COST, warmup: 5
    })).toThrow(/not enough/);
  });
  it("marks-to-market a held position across held bars", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 + i * 2);
    const res = backtest2({
      closes, strategy: momentumStrategy(55), fast: 3, slow: 14,
      threshold: 0, notional: 1000, costs: NO_COST, warmup: 15
    });
    expect(res.netReturns.length).toBeGreaterThan(0);
    expect(res.report).toBeTruthy();
    expect(res.netReturns.some(r => r !== 0)).toBe(true);
  });
});
