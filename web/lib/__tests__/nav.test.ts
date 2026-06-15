import { describe, it, expect } from "vitest";
import { NAV_ITEMS, visibleNav, activeRoute } from "../nav";

describe("visibleNav", () => {
  it("shows unrestricted items to everyone", () => {
    const vis = visibleNav(NAV_ITEMS, new Set());
    expect(vis.map(i => i.id)).toContain("dashboard");
    expect(vis.map(i => i.id)).toContain("leaderboard");
  });
  it("hides restricted items without permission", () => {
    const vis = visibleNav(NAV_ITEMS, new Set());
    expect(vis.map(i => i.id)).not.toContain("custody");
    expect(vis.map(i => i.id)).not.toContain("config");
  });
  it("reveals restricted items with permission", () => {
    const vis = visibleNav(NAV_ITEMS, new Set(["trade", "configure"]));
    expect(vis.map(i => i.id)).toEqual(["dashboard", "custody", "leaderboard", "config"]);
  });
});

describe("activeRoute", () => {
  it("root => dashboard", () => expect(activeRoute("/", NAV_ITEMS)).toBe("dashboard"));
  it("matches custody", () => expect(activeRoute("/custody", NAV_ITEMS)).toBe("custody"));
  it("matches nested path by prefix", () => expect(activeRoute("/leaderboard/public", NAV_ITEMS)).toBe("leaderboard"));
  it("unknown path => null", () => expect(activeRoute("/nope", NAV_ITEMS)).toBeNull());
});
