/** Pure account/settings view-model. */
export type Role = "owner" | "trader" | "viewer";
export interface AccountProfile { email: string; role: Role; tenantId: string; createdAt: number; }

const ROLE_PERMS: Record<Role, string[]> = {
  owner: ["read", "trade", "configure", "manage_users", "withdraw"],
  trader: ["read", "trade", "configure"],
  viewer: ["read"]
};

export function permissionsFor(role: Role): string[] { return ROLE_PERMS[role]; }
export function canManageUsers(role: Role): boolean { return ROLE_PERMS[role].includes("manage_users"); }

/** Human-friendly member-since string from a unix-ms timestamp + formatter. */
export function memberSince(createdAt: number, fmt: (d: Date) => string): string {
  return fmt(new Date(createdAt));
}
