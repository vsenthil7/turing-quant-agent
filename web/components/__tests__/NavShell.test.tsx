import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NavShell } from "../NavShell";

function setup(overrides = {}) {
  const props = { active: "dashboard" as const, permissions: ["trade", "configure"], onNavigate: vi.fn(), ...overrides };
  render(<NavShell {...props}><div>content here</div></NavShell>);
  return props;
}

describe("NavShell", () => {
  it("renders children in main", () => {
    setup();
    expect(screen.getByRole("main")).toHaveTextContent("content here");
  });
  it("shows all nav items with full permissions", () => {
    setup();
    ["Dashboard", "Funds", "Leaderboard", "Config"].forEach(l =>
      expect(screen.getByRole("button", { name: l })).toBeInTheDocument());
  });
  it("hides restricted items without permission", () => {
    setup({ permissions: [] });
    expect(screen.queryByRole("button", { name: "Funds" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Config" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
  });
  it("marks the active route with aria-current", () => {
    setup({ active: "leaderboard" });
    expect(screen.getByRole("button", { name: "Leaderboard" })).toHaveAttribute("aria-current", "page");
  });
  it("navigating fires callback with path", async () => {
    const p = setup();
    await userEvent.click(screen.getByRole("button", { name: "Leaderboard" }));
    expect(p.onNavigate).toHaveBeenCalledWith("/leaderboard");
  });
  it("supports keyboard activation", async () => {
    const p = setup();
    const btn = screen.getByRole("button", { name: "Config" });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(p.onNavigate).toHaveBeenCalledWith("/config");
  });
  it("has an accessible primary nav landmark", () => {
    setup();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<NavShell active="dashboard" permissions={["trade","configure"]} onNavigate={() => {}}><div>x</div></NavShell>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
