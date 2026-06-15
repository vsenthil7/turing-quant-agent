import { describe, it, expect } from "vitest";
import { NAV_ITEMS, visibleNav, activeRoute } from "../nav";

describe("nav edge cases", () => {
  it("partial permissions reveal only matching items", () => {
    const vis = visibleNav(NAV_ITEMS, new Set(["trade"]));
    expect(vis.map(i => i.id)).toContain("custody");
    expect(vis.map(i => i.id)).not.toContain("config");
  });
  it("activeRoute prefers longer prefix match", () => {
    const items = [...NAV_ITEMS, { id: "config" as const, label: "X", path: "/config/advanced" }];
    expect(activeRoute("/config/advanced", items)).toBe("config");
  });
  it("activeRoute root never matches non-root items", () => {
    expect(activeRoute("/", NAV_ITEMS)).toBe("dashboard");
  });
  it("empty items => null for non-root", () => expect(activeRoute("/x", [])).toBeNull());
});
