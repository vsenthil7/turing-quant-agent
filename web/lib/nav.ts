/** Pure navigation model. Routes + active-state logic, framework-free. */
export type RouteId = "dashboard" | "custody" | "leaderboard" | "config";

export interface NavItem { id: RouteId; label: string; path: string; requires?: string; }

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/" },
  { id: "custody", label: "Funds", path: "/custody", requires: "trade" },
  { id: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
  { id: "config", label: "Config", path: "/config", requires: "configure" }
];

/** Items visible to a set of permissions (undefined requires => always visible). */
export function visibleNav(items: NavItem[], permissions: Set<string>): NavItem[] {
  return items.filter(i => !i.requires || permissions.has(i.requires));
}

/** Match the active route id from a path (longest-prefix, root special-cased). */
export function activeRoute(path: string, items: NavItem[]): RouteId | null {
  if (path === "/") return "dashboard";
  const match = items
    .filter(i => i.path !== "/" && path.startsWith(i.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match ? match.id : null;
}
