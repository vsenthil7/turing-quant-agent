/** Multi-tenant account + permission domain logic. Pure. Auth provider and
 *  persistence are injected (Desktop); all rules + invariants are here. */

export type Role = "owner" | "trader" | "viewer";

export interface Account {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  createdAt: number;
  active: boolean;
}

export interface Session {
  accountId: string;
  tenantId: string;
  issuedAt: number;
  expiresAt: number;
}

const PERMISSIONS: Record<Role, Set<string>> = {
  owner: new Set(["read", "trade", "configure", "manage_users", "withdraw"]),
  trader: new Set(["read", "trade", "configure"]),
  viewer: new Set(["read"])
};

export function can(role: Role, action: string): boolean {
  return PERMISSIONS[role].has(action);
}

/** Validate a session against a clock. */
export function isSessionValid(s: Session, now: number): boolean {
  return now >= s.issuedAt && now < s.expiresAt;
}

/** Enforce tenant isolation: an actor may only touch resources in its tenant. */
export function assertSameTenant(actorTenant: string, resourceTenant: string): void {
  if (actorTenant !== resourceTenant) {
    throw new Error("TENANT_ISOLATION_VIOLATION");
  }
}

/** Authorize an action: valid session + role permission + tenant match. */
export function authorize(
  account: Account,
  session: Session,
  action: string,
  resourceTenant: string,
  now: number
): void {
  if (!account.active) throw new Error("ACCOUNT_INACTIVE");
  if (session.accountId !== account.id) throw new Error("SESSION_MISMATCH");
  if (!isSessionValid(session, now)) throw new Error("SESSION_EXPIRED");
  assertSameTenant(account.tenantId, resourceTenant);
  if (!can(account.role, action)) throw new Error("FORBIDDEN");
}
