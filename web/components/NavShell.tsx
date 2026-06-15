import React from "react";
import { NAV_ITEMS, visibleNav, type RouteId } from "../lib/nav";

export interface NavShellProps {
  active: RouteId;
  permissions: string[];
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function NavShell({ active, permissions, onNavigate, children }: NavShellProps) {
  const items = visibleNav(NAV_ITEMS, new Set(permissions));
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Primary">
        <span className="brand">QUANT AGENT</span>
        <ul role="list">
          {items.map(i => (
            <li key={i.id}>
              <button
                className={`nav-link ${active === i.id ? "active" : ""}`}
                aria-current={active === i.id ? "page" : undefined}
                onClick={() => onNavigate(i.path)}
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content" role="main">{children}</main>
    </div>
  );
}
