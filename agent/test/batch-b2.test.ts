import { describe, it, expect, vi } from "vitest";
import { parseTenantConfig } from "../src/config2.js";
import { notify } from "../src/notifications.js";
import { handlePublicLeaderboard, handleTenantLeaderboard, handleDeposit, handleWithdraw, handleBalance } from "../src/api2.js";
import type { Account, Session } from "../src/domain/accounts.js";

const goodTenantCfg = {
  aiMode: "gate", risk: { maxPositionSize: 100, maxDrawdownPct: 0.2 },
  signals: { fast: 5, slow: 20, weights: { maCross: 0.5, momentum: 0.5 } }, dryRun: true,
  tenantId: "t1", strategy: "momentum", fees: { managementBps: 200, performanceBps: 2000 },
  notional: 1000, budgetUsdPerDay: 50
};

describe("B8 tenant config", () => {
  it("parses valid tenant config", () => expect(parseTenantConfig(goodTenantCfg).strategy).toBe("momentum"));
  it("rejects unknown strategy", () => expect(() => parseTenantConfig({ ...goodTenantCfg, strategy: "magic" })).toThrow());
});

describe("B10 notifications", () => {
  const prefs = { onDecision: true, onSettle: true, onHalt: true, channels: ["push" as const] };
  it("decision -> notification", () => expect(notify({ type: "DecisionMade", seq: 0, action: 1, size: 10 }, prefs)).toHaveLength(1));
  it("hold muted", () => expect(notify({ type: "DecisionMade", seq: 0, action: 0, size: 0 }, prefs)).toHaveLength(0));
  it("loss is high priority", () => expect(notify({ type: "TradeSettled", seq: 0, pnl: -5 }, prefs)[0]!.priority).toBe("high"));
  it("respects mute pref", () => expect(notify({ type: "Halted", reason: "x" }, { ...prefs, onHalt: false })).toHaveLength(0));
});

const owner: Account = { id: "u1", email: "o@x.c", role: "owner", tenantId: "t1", createdAt: 0, active: true };
const viewer: Account = { id: "u2", email: "v@x.c", role: "viewer", tenantId: "t1", createdAt: 0, active: true };
const sess = (id: string): Session => ({ accountId: id, tenantId: "t1", issuedAt: 0, expiresAt: 1000 });

describe("B9 api2", () => {
  it("public leaderboard returns verified only", () => {
    const recs = [{ agentId: "a", tenantId: "t1", cumulativePnl: 1, sharpe: 1, hitRate: 0.5, trades: 1, reputation: 1, verified: true }];
    expect(handlePublicLeaderboard(recs).status).toBe(200);
  });
  it("tenant leaderboard requires auth", () => {
    expect(handleTenantLeaderboard(viewer, sess("u2"), "t1", [], 10).status).toBe(200);
    expect(handleTenantLeaderboard(viewer, sess("u2"), "t2", [], 10).status).toBe(403); // cross-tenant
  });
  it("deposit allowed for owner, updates balance", () => {
    const r = handleDeposit(owner, sess("u1"), { available: 0, locked: 0 }, 100, 10);
    expect(r.status).toBe(200);
    expect((r.body as any).balance.available).toBe(100);
  });
  it("withdraw forbidden for viewer", () => {
    expect(handleWithdraw(viewer, sess("u2"), { available: 100, locked: 0 }, 10, 10).status).toBe(403);
  });
  it("withdraw enforces funds", () => {
    expect(handleWithdraw(owner, sess("u1"), { available: 5, locked: 0 }, 10, 10).status).toBe(400);
  });
  it("balance reconstructs from entries", () => {
    const entries = [{ id: "1", accountId: "u1", type: "deposit" as const, amount: 50, timestamp: 0 }];
    expect((handleBalance(owner, sess("u1"), entries, 10).body as any).available).toBe(50);
  });
});
