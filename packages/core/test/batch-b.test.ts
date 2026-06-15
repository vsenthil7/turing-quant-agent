import { describe, it, expect } from "vitest";
import { momentumStrategy, breakoutStrategy, meanReversionStrategy } from "../src/strategies-extra.js";
import { openPosition, closePosition, unrealizedPnl, transition } from "../src/position.js";
import { validateOrder, shouldTrigger } from "../src/orders.js";
import { evaluateAlerts } from "../src/alerts.js";
import { rebalance, turnover } from "../src/rebalance.js";
import { toCsv, toStableJson } from "../src/auditExport.js";

const up = Array.from({ length: 40 }, (_, i) => 100 + i);

describe("B1 strategies", () => {
  it("momentum goes long in uptrend", () => expect(momentumStrategy().evaluate({ closes: up, fast: 5, slow: 20, threshold: 0.1 }).action).toBe(1));
  it("breakout triggers long on new high", () => {
    const r = breakoutStrategy(10).evaluate({ closes: up, fast: 5, slow: 20, threshold: 0.1 });
    expect(r.action).toBe(1);
  });
  it("mean-reversion fades a spike", () => {
    const spike = [...Array.from({ length: 25 }, () => 100), 130];
    expect(meanReversionStrategy(20).evaluate({ closes: spike, fast: 5, slow: 20, threshold: 0.1 }).action).toBe(-1);
  });
});

describe("B2 position lifecycle", () => {
  it("long pnl positive when price rises", () => {
    const p = openPosition("long", 10, 100);
    expect(unrealizedPnl(p, 110)).toBe(100);
  });
  it("close realizes pnl", () => {
    const p = openPosition("short", 10, 100);
    expect(closePosition(p, 90).realizedPnl).toBe(100);
  });
  it("transition flips long->short, realizing pnl", () => {
    const long = openPosition("long", 10, 100);
    const r = transition(long, -1, 10, 120);
    expect(r.realizedPnl).toBe(200);
    expect(r.position!.side).toBe("short");
  });
  it("transition to flat closes", () => {
    const long = openPosition("long", 5, 100);
    expect(transition(long, 0, 0, 110).position!.open).toBe(false);
  });
  it("cannot close twice", () => {
    const p = closePosition(openPosition("long", 1, 100), 100).closed;
    expect(() => closePosition(p, 100)).toThrow("ALREADY_CLOSED");
  });
});

describe("B3 orders", () => {
  it("market always triggers", () => expect(shouldTrigger({ kind: "market", side: "buy", size: 1 }, 100)).toBe(true));
  it("buy limit fills below limit", () => expect(shouldTrigger({ kind: "limit", side: "buy", size: 1, limitPrice: 100 }, 99)).toBe(true));
  it("sell stop triggers below stop", () => expect(shouldTrigger({ kind: "stop", side: "sell", size: 1, stopPrice: 100 }, 95)).toBe(true));
  it("limit without price throws", () => expect(() => validateOrder({ kind: "limit", side: "buy", size: 1 })).toThrow("LIMIT_REQUIRES_PRICE"));
});

describe("B4 alerts", () => {
  const t = { drawdownWarn: 0.1, drawdownCrit: 0.2, dailyLossCrit: 0.1, maxConsecutiveLosses: 5, llmErrorWarn: 0.1 };
  it("critical drawdown sorts first", () => {
    const alerts = evaluateAlerts({ drawdown: 0.25, dailyLossPct: 0, consecutiveLosses: 0, llmErrorRate: 0, oracleStale: false }, t);
    expect(alerts[0]!.severity).toBe("critical");
  });
  it("no alerts when healthy", () => {
    expect(evaluateAlerts({ drawdown: 0, dailyLossPct: 0, consecutiveLosses: 0, llmErrorRate: 0, oracleStale: false }, t)).toHaveLength(0);
  });
});

describe("B6 rebalance", () => {
  it("produces buy/sell orders from weight diff", () => {
    const orders = rebalance([{ asset: "A", weight: 0.5 }], [{ asset: "A", weight: 0.2 }, { asset: "B", weight: 0.3 }]);
    expect(orders.find(o => o.asset === "A")!.side).toBe("sell");
    expect(orders.find(o => o.asset === "B")!.side).toBe("buy");
  });
  it("ignores dust", () => {
    expect(rebalance([{ asset: "A", weight: 0.5 }], [{ asset: "A", weight: 0.5005 }])).toHaveLength(0);
  });
  it("turnover sums deltas", () => {
    expect(turnover([{ asset: "A", deltaWeight: 0.3, side: "sell" }, { asset: "B", deltaWeight: 0.3, side: "buy" }])).toBeCloseTo(0.6);
  });
});

describe("B7 audit export", () => {
  it("csv has sorted stable columns", () => {
    expect(toCsv([{ b: 2, a: 1 }])).toBe("a,b\n1,2");
  });
  it("escapes commas", () => {
    expect(toCsv([{ x: "a,b" }])).toBe('x\n"a,b"');
  });
  it("empty rows -> empty string", () => expect(toCsv([])).toBe(""));
  it("stable json sorts keys", () => expect(toStableJson([{ b: 1, a: 2 }])).toBe('[{"a":2,"b":1}]'));
});
