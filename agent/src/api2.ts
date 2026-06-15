/** API handlers v2: leaderboard, accounts, custody. Pure handlers over injected
 *  domain state. A thin server (Desktop) binds these; logic + auth checks here. */
import { authorize, type Account, type Session } from "./domain/accounts.js";
import { applyEntry, foldEntries, type LedgerEntry, type Balance } from "./domain/ledger.js";
import { publicBoard, tenantBoard, type AgentRecord } from "./domain/leaderboard.js";
import type { ApiResponse } from "./api.js";

const ok = <T>(body: T): ApiResponse<T> => ({ status: 200, body });
const bad = (m: string): ApiResponse<{ error: string }> => ({ status: 400, body: { error: m } });
const forbidden = (m: string): ApiResponse<{ error: string }> => ({ status: 403, body: { error: m } });

/** GET /leaderboard/public — verified-only global board. */
export function handlePublicLeaderboard(records: AgentRecord[]): ApiResponse {
  return ok(publicBoard(records));
}

/** GET /leaderboard/:tenant — tenant board, requires read auth in that tenant. */
export function handleTenantLeaderboard(
  account: Account, session: Session, tenantId: string, records: AgentRecord[], now: number
): ApiResponse {
  try {
    authorize(account, session, "read", tenantId, now);
  } catch (e) {
    return forbidden((e as Error).message);
  }
  return ok(tenantBoard(records, tenantId));
}

/** POST /deposit — requires trade permission; appends a ledger entry. */
export function handleDeposit(
  account: Account, session: Session, balance: Balance, amount: number, now: number
): ApiResponse {
  try {
    authorize(account, session, "trade", account.tenantId, now);
  } catch (e) {
    return forbidden((e as Error).message);
  }
  if (!Number.isFinite(amount) || amount <= 0) return bad("invalid amount");
  const entry: LedgerEntry = { id: `dep-${now}`, accountId: account.id, type: "deposit", amount, timestamp: now };
  return ok({ balance: applyEntry(balance, entry), entry });
}

/** POST /withdraw — requires withdraw permission (owner only); enforces funds. */
export function handleWithdraw(
  account: Account, session: Session, balance: Balance, amount: number, now: number
): ApiResponse {
  try {
    authorize(account, session, "withdraw", account.tenantId, now);
  } catch (e) {
    return forbidden((e as Error).message);
  }
  if (!Number.isFinite(amount) || amount <= 0) return bad("invalid amount");
  try {
    const entry: LedgerEntry = { id: `wd-${now}`, accountId: account.id, type: "withdraw", amount, timestamp: now };
    return ok({ balance: applyEntry(balance, entry), entry });
  } catch (e) {
    return bad((e as Error).message);
  }
}

/** GET /balance — reconstruct from entries (read auth). */
export function handleBalance(
  account: Account, session: Session, entries: LedgerEntry[], now: number
): ApiResponse {
  try {
    authorize(account, session, "read", account.tenantId, now);
  } catch (e) {
    return forbidden((e as Error).message);
  }
  return ok(foldEntries(entries));
}
