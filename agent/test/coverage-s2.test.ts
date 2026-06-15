/** Sprint 2 agent coverage-closing tests: negative + branch paths to 100%.
 *  Targets api2, notifications, and domain (accounts, feeModel, leaderboard,
 *  ledger, ratelimit). */
import { describe, it, expect } from "vitest";
import {
  handleDeposit, handleWithdraw, handleBalance,
  handlePublicLeaderboard, handleTenantLeaderboard
} from "../src/api2.js";
import { notify, type NotificationPrefs } from "../src/notifications.js";
import type { DomainEvent } from "../src/events.js";
import { authorize, type Account, type Session } from "../src/domain/accounts.js";
import { performanceFee, managementFee } from "../src/domain/feeModel.js";
import { rank, type AgentRecord } from "../src/domain/leaderboard.js";
import { applyEntry, lock, release, foldEntries, equity, type Balance, type LedgerEntry } from "../src/domain/ledger.js";
import { consume, charge, type Bucket, type Budget } from "../src/domain/ratelimit.js";

const owner: Account = { id: "a1", email: "o@x.io", role: "owner", tenantId: "t1", createdAt: 0, active: true };
const session: Session = { accountId: "a1", tenantId: "t1", issuedAt: 0, expiresAt: 1_000_000 };
const NOW = 100;

describe("api2 — invalid-amount + insufficient-funds branches", () => {
  const zeroBal: Balance = { available: 0, locked: 0 };
  it("deposit rejects non-positive/NaN amount (400)", () => {
    expect(handleDeposit(owner, session, zeroBal, 0, NOW).status).toBe(400);
    expect(handleDeposit(owner, session, zeroBal, NaN, NOW).status).toBe(400);
  });
  it("deposit succeeds with valid amount", () => {
    expect(handleDeposit(owner, session, zeroBal, 100, NOW).status).toBe(200);
  });
  it("withdraw rejects invalid amount (400)", () => {
    expect(handleWithdraw(owner, session, zeroBal, -5, NOW).status).toBe(400);
  });
  it("withdraw over balance returns 400 (INSUFFICIENT_FUNDS via inner catch)", () => {
    const r = handleWithdraw(owner, session, { available: 10, locked: 0 }, 50, NOW);
    expect(r.status).toBe(400);
  });
  it("withdraw within balance succeeds", () => {
    expect(handleWithdraw(owner, session, { available: 100, locked: 0 }, 40, NOW).status).toBe(200);
  });
  it("balance + public board succeed", () => {
    expect(handleBalance(owner, session, [], NOW).status).toBe(200);
    expect(handlePublicLeaderboard([]).status).toBe(200);
  });
  it("forbidden paths: expired session -> 403", () => {
    const expired: Session = { ...session, expiresAt: 1 };
    expect(handleDeposit(owner, expired, zeroBal, 10, NOW).status).toBe(403);
    expect(handleWithdraw(owner, expired, zeroBal, 10, NOW).status).toBe(403);
    expect(handleBalance(owner, expired, [], NOW).status).toBe(403);
    expect(handleTenantLeaderboard(owner, expired, "t1", [], NOW).status).toBe(403);
  });
  it("tenant board authorized -> 200", () => {
    expect(handleTenantLeaderboard(owner, session, "t1", [], NOW).status).toBe(200);
  });
});

describe("notifications — mute + priority branches", () => {
  const prefs: NotificationPrefs = { onDecision: true, onSettle: true, onHalt: true, channels: ["push", "email"] };
  it("DecisionMade muted when action=0 or onDecision=false", () => {
    expect(notify({ type: "DecisionMade", action: 0, size: 1 } as DomainEvent, prefs)).toEqual([]);
    expect(notify({ type: "DecisionMade", action: 1, size: 1 } as DomainEvent, { ...prefs, onDecision: false })).toEqual([]);
  });
  it("DecisionMade LONG/SHORT produce per-channel notifications", () => {
    expect(notify({ type: "DecisionMade", action: 1, size: 2 } as DomainEvent, prefs)).toHaveLength(2);
    expect(notify({ type: "DecisionMade", action: -1, size: 2 } as DomainEvent, prefs)[0]!.body).toContain("SHORT");
  });
  it("TradeSettled: muted, negative-PnL high priority, positive normal", () => {
    expect(notify({ type: "TradeSettled", pnl: 5 } as DomainEvent, { ...prefs, onSettle: false })).toEqual([]);
    expect(notify({ type: "TradeSettled", pnl: -5 } as DomainEvent, prefs)[0]!.priority).toBe("high");
    expect(notify({ type: "TradeSettled", pnl: 5 } as DomainEvent, prefs)[0]!.priority).toBe("normal");
  });
  it("Halted: muted vs emitted", () => {
    expect(notify({ type: "Halted", reason: "kill" } as DomainEvent, { ...prefs, onHalt: false })).toEqual([]);
    expect(notify({ type: "Halted", reason: "kill" } as DomainEvent, prefs)[0]!.priority).toBe("high");
  });
  it("unknown event -> []", () => {
    expect(notify({ type: "Unknown" } as unknown as DomainEvent, prefs)).toEqual([]);
  });
});

describe("accounts — authorize negative branches", () => {
  it("inactive account", () => {
    expect(() => authorize({ ...owner, active: false }, session, "read", "t1", NOW)).toThrow("ACCOUNT_INACTIVE");
  });
  it("session mismatch", () => {
    expect(() => authorize(owner, { ...session, accountId: "other" }, "read", "t1", NOW)).toThrow("SESSION_MISMATCH");
  });
  it("expired session", () => {
    expect(() => authorize(owner, { ...session, expiresAt: 1 }, "read", "t1", NOW)).toThrow("SESSION_EXPIRED");
  });
  it("tenant isolation", () => {
    expect(() => authorize(owner, session, "read", "t2", NOW)).toThrow("TENANT_ISOLATION_VIOLATION");
  });
  it("forbidden action for role", () => {
    const viewer: Account = { ...owner, role: "viewer" };
    const vSession: Session = { ...session };
    expect(() => authorize(viewer, vSession, "withdraw", "t1", NOW)).toThrow("FORBIDDEN");
  });
});

describe("feeModel — guards + computations", () => {
  const sched = { managementBps: 200, performanceBps: 2000 };
  it("performance fee 0 below HWM, positive above", () => {
    expect(performanceFee(90, 100, sched)).toBe(0);
    expect(performanceFee(200, 100, sched)).toBeCloseTo(20, 6);
  });
  it("management fee throws on negative input", () => {
    expect(() => managementFee(-1, 0.5, sched)).toThrow("NEGATIVE_INPUT");
    expect(() => managementFee(1000, -0.5, sched)).toThrow("NEGATIVE_INPUT");
  });
  it("management fee accrues over year fraction", () => {
    expect(managementFee(10_000, 0.5, sched)).toBeCloseTo(100, 6);
  });
});

describe("leaderboard — tie-break branch", () => {
  it("equal scores break ties by agentId", () => {
    const base: Omit<AgentRecord, "agentId"> = {
      tenantId: "t1", cumulativePnl: 100, sharpe: 1, hitRate: 0.5, trades: 10, reputation: 5, verified: true
    };
    const ranked = rank([{ ...base, agentId: "zeta" }, { ...base, agentId: "alpha" }]);
    expect(ranked[0]!.agentId).toBe("alpha");
    expect(ranked[1]!.rank).toBe(2);
  });
});

describe("ledger — all entry types + lock/release/equity guards", () => {
  const start: Balance = { available: 100, locked: 0 };
  it("deposit / withdraw / pnl", () => {
    expect(applyEntry(start, { id: "1", accountId: "a", type: "deposit", amount: 50, timestamp: 0 }).available).toBe(150);
    expect(applyEntry(start, { id: "2", accountId: "a", type: "withdraw", amount: 40, timestamp: 0 }).available).toBe(60);
    expect(applyEntry(start, { id: "3", accountId: "a", type: "pnl", amount: 25, timestamp: 0 }).available).toBe(125);
  });
  it("fee within funds + insufficient fee branch", () => {
    expect(applyEntry(start, { id: "4", accountId: "a", type: "fee", amount: 10, timestamp: 0 }).available).toBe(90);
    expect(() => applyEntry({ available: 5, locked: 0 }, { id: "5", accountId: "a", type: "fee", amount: 10, timestamp: 0 }))
      .toThrow("INSUFFICIENT_FUNDS_FOR_FEE");
  });
  it("negative amount + insufficient withdraw", () => {
    expect(() => applyEntry(start, { id: "6", accountId: "a", type: "deposit", amount: -1, timestamp: 0 })).toThrow("NEGATIVE_AMOUNT");
    expect(() => applyEntry({ available: 5, locked: 0 }, { id: "7", accountId: "a", type: "withdraw", amount: 10, timestamp: 0 }))
      .toThrow("INSUFFICIENT_FUNDS");
  });
  it("lock guards + happy path", () => {
    expect(lock(start, 30)).toEqual({ available: 70, locked: 30 });
    expect(() => lock(start, -1)).toThrow("NEGATIVE_AMOUNT");
    expect(() => lock(start, 1000)).toThrow("INSUFFICIENT_FUNDS");
  });
  it("release guards + happy path", () => {
    const locked: Balance = { available: 0, locked: 50 };
    expect(release(locked, 20)).toEqual({ available: 20, locked: 30 });
    expect(() => release(locked, -1)).toThrow("NEGATIVE_AMOUNT");
    expect(() => release(locked, 1000)).toThrow("OVER_RELEASE");
  });
  it("foldEntries + equity", () => {
    const entries: LedgerEntry[] = [
      { id: "a", accountId: "x", type: "deposit", amount: 100, timestamp: 0 },
      { id: "b", accountId: "x", type: "withdraw", amount: 30, timestamp: 1 }
    ];
    const bal = foldEntries(entries);
    expect(bal.available).toBe(70);
    expect(equity({ available: 70, locked: 30 })).toBe(100);
  });
});

describe("ratelimit — token bucket + budget branches", () => {
  const bucket: Bucket = { tokens: 5, capacity: 10, refillPerSec: 1, lastRefill: 0 };
  it("consume negative cost throws", () => {
    expect(() => consume(bucket, -1, 0)).toThrow("NEGATIVE_COST");
  });
  it("allowed when enough tokens (with refill)", () => {
    const r = consume(bucket, 6, 2); // 5 + 2 refill = 7 >= 6
    expect(r.allowed).toBe(true);
    expect(r.bucket.tokens).toBeCloseTo(1, 6);
  });
  it("denied when insufficient tokens", () => {
    const r = consume({ ...bucket, tokens: 0, lastRefill: 0 }, 6, 1); // 0 + 1 = 1 < 6
    expect(r.allowed).toBe(false);
    expect(r.bucket.tokens).toBeCloseTo(1, 6);
  });
  it("budget: negative + over-limit + allowed", () => {
    const budget: Budget = { spent: 0, limit: 100 };
    expect(() => charge(budget, -1)).toThrow("NEGATIVE_AMOUNT");
    expect(charge(budget, 150).allowed).toBe(false);
    const ok = charge(budget, 40);
    expect(ok.allowed).toBe(true);
    expect(ok.budget.spent).toBe(40);
  });
});
