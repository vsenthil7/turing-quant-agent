import { describe, it, expect } from "vitest";
import { can, authorize, isSessionValid, type Account, type Session } from "../src/domain/accounts.js";
import { applyEntry, lock, release, foldEntries, equity } from "../src/domain/ledger.js";
import { performanceFee, managementFee } from "../src/domain/feeModel.js";
import { rank, publicBoard, score, type AgentRecord } from "../src/domain/leaderboard.js";
import { consume, charge } from "../src/domain/ratelimit.js";

describe("accounts", () => {
  const acct: Account = { id: "u1", email: "a@b.c", role: "trader", tenantId: "t1", createdAt: 0, active: true };
  const sess: Session = { accountId: "u1", tenantId: "t1", issuedAt: 0, expiresAt: 100 };
  it("permissions per role", () => {
    expect(can("owner", "withdraw")).toBe(true);
    expect(can("viewer", "trade")).toBe(false);
    expect(can("trader", "manage_users")).toBe(false);
  });
  it("session validity", () => {
    expect(isSessionValid(sess, 50)).toBe(true);
    expect(isSessionValid(sess, 100)).toBe(false);
  });
  it("authorize passes for valid trader action", () => {
    expect(() => authorize(acct, sess, "trade", "t1", 50)).not.toThrow();
  });
  it("authorize blocks cross-tenant", () => {
    expect(() => authorize(acct, sess, "trade", "t2", 50)).toThrow("TENANT_ISOLATION");
  });
  it("authorize blocks forbidden action", () => {
    expect(() => authorize(acct, sess, "withdraw", "t1", 50)).toThrow("FORBIDDEN");
  });
  it("authorize blocks expired session", () => {
    expect(() => authorize(acct, sess, "trade", "t1", 200)).toThrow("SESSION_EXPIRED");
  });
});

describe("ledger invariants", () => {
  it("deposit then withdraw", () => {
    let b = { available: 0, locked: 0 };
    b = applyEntry(b, { id: "1", accountId: "u", type: "deposit", amount: 100, timestamp: 0 });
    b = applyEntry(b, { id: "2", accountId: "u", type: "withdraw", amount: 40, timestamp: 1 });
    expect(b.available).toBe(60);
  });
  it("cannot overdraw", () => {
    expect(() => applyEntry({ available: 10, locked: 0 }, { id: "x", accountId: "u", type: "withdraw", amount: 20, timestamp: 0 }))
      .toThrow("INSUFFICIENT_FUNDS");
  });
  it("lock and release conserve equity", () => {
    const start = { available: 100, locked: 0 };
    const locked = lock(start, 30);
    expect(equity(locked)).toBe(100);
    const released = release(locked, 30);
    expect(released).toEqual(start);
  });
  it("cannot over-release", () => {
    expect(() => release({ available: 0, locked: 10 }, 20)).toThrow("OVER_RELEASE");
  });
  it("foldEntries reconstructs balance", () => {
    const b = foldEntries([
      { id: "1", accountId: "u", type: "deposit", amount: 100, timestamp: 0 },
      { id: "2", accountId: "u", type: "fee", amount: 5, timestamp: 1 }
    ]);
    expect(b.available).toBe(95);
  });
});

describe("fees", () => {
  it("performance fee only above HWM", () => {
    expect(performanceFee(1200, 1000, { managementBps: 0, performanceBps: 2000 })).toBeCloseTo(40);
    expect(performanceFee(900, 1000, { managementBps: 0, performanceBps: 2000 })).toBe(0);
  });
  it("management fee accrues pro-rata", () => {
    expect(managementFee(10000, 0.5, { managementBps: 200, performanceBps: 0 })).toBeCloseTo(100);
  });
});

describe("leaderboard", () => {
  const recs: AgentRecord[] = [
    { agentId: "a", tenantId: "t1", cumulativePnl: 500, sharpe: 1.5, hitRate: 0.6, trades: 50, reputation: 100, verified: true },
    { agentId: "b", tenantId: "t1", cumulativePnl: 800, sharpe: 2.0, hitRate: 0.65, trades: 60, reputation: 200, verified: true },
    { agentId: "c", tenantId: "t2", cumulativePnl: 999, sharpe: 3.0, hitRate: 0.9, trades: 10, reputation: 50, verified: false }
  ];
  it("ranks verified higher than equal unverified", () => {
    const board = rank(recs);
    expect(board[0]!.rank).toBe(1);
    // unverified 'c' heavily discounted despite great raw stats
    const cRank = board.find(r => r.agentId === "c")!.rank;
    expect(cRank).toBeGreaterThan(1);
  });
  it("public board excludes unverified", () => {
    expect(publicBoard(recs).every(r => r.verified)).toBe(true);
  });
  it("verified scores higher than identical unverified", () => {
    const base = { agentId: "x", tenantId: "t", cumulativePnl: 100, sharpe: 1, hitRate: 0.5, trades: 10, reputation: 10, verified: true };
    expect(score(base)).toBeGreaterThan(score({ ...base, verified: false }));
  });
});

describe("ratelimit + budget", () => {
  it("token bucket allows then blocks", () => {
    let b = { tokens: 2, capacity: 5, refillPerSec: 0, lastRefill: 0 };
    let r = consume(b, 1, 0); expect(r.allowed).toBe(true); b = r.bucket;
    r = consume(b, 2, 0); expect(r.allowed).toBe(false);
  });
  it("refills over time", () => {
    const b = { tokens: 0, capacity: 5, refillPerSec: 1, lastRefill: 0 };
    expect(consume(b, 3, 5).allowed).toBe(true);
  });
  it("budget enforces hard cap", () => {
    const r = charge({ spent: 90, limit: 100 }, 20);
    expect(r.allowed).toBe(false);
    expect(charge({ spent: 90, limit: 100 }, 5).allowed).toBe(true);
  });
});
