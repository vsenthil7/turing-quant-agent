import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Leaderboard, type LeaderRow } from "../Leaderboard";

const rows: LeaderRow[] = [
  { rank: 1, agentId: "alpha", cumulativePnl: 800, sharpe: 2.1, hitRate: 0.65, reputation: 200, verified: true },
  { rank: 2, agentId: "beta", cumulativePnl: -50, sharpe: 0.5, hitRate: 0.45, reputation: 30, verified: false }
];

describe("Leaderboard", () => {
  it("empty state", () => {
    render(<Leaderboard rows={[]} />);
    expect(screen.getByText("No ranked agents yet")).toBeInTheDocument();
  });
  it("renders ranked rows", () => {
    render(<Leaderboard rows={rows} />);
    expect(screen.getByTestId("leader-1")).toHaveTextContent("alpha");
    expect(screen.getByTestId("leader-2")).toHaveTextContent("beta");
  });
  it("marks verified vs unverified", () => {
    render(<Leaderboard rows={rows} />);
    expect(screen.getByLabelText("verified")).toBeInTheDocument();
    expect(screen.getByLabelText("unverified")).toBeInTheDocument();
  });
  it("colors pnl by sign", () => {
    render(<Leaderboard rows={rows} />);
    expect(screen.getByText("800")).toHaveClass("pos");
    expect(screen.getByText("-50")).toHaveClass("neg");
  });
  it("uses an accessible table with caption label", () => {
    render(<Leaderboard rows={rows} title="Public Board" />);
    expect(screen.getByRole("table", { name: "Public Board" })).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<Leaderboard rows={rows} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
