import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeaderboardView, sortRows } from "../LeaderboardView";
import type { LeaderRow } from "../Leaderboard";

const rows: LeaderRow[] = [
  { rank: 1, agentId: "alpha", cumulativePnl: 800, sharpe: 2.1, hitRate: 0.65, reputation: 200, verified: true },
  { rank: 2, agentId: "beta", cumulativePnl: 1200, sharpe: 1.0, hitRate: 0.5, reputation: 50, verified: true },
  { rank: 3, agentId: "gamma", cumulativePnl: -50, sharpe: 0.2, hitRate: 0.4, reputation: 10, verified: false }
];

describe("sortRows", () => {
  it("rank ascending", () => expect(sortRows(rows, "rank")[0]!.agentId).toBe("alpha"));
  it("pnl descending", () => expect(sortRows(rows, "cumulativePnl")[0]!.agentId).toBe("beta"));
  it("sharpe descending", () => expect(sortRows(rows, "sharpe")[0]!.agentId).toBe("alpha"));
  it("reputation descending", () => expect(sortRows(rows, "reputation")[0]!.agentId).toBe("alpha"));
});

describe("LeaderboardView", () => {
  it("shows loading", () => {
    render(<LeaderboardView status="loading" rows={[]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("shows error with retry", async () => {
    const onRetry = vi.fn();
    render(<LeaderboardView status="error" error="boom" rows={[]} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });
  it("shows empty state", () => {
    render(<LeaderboardView status="ready" rows={[]} />);
    expect(screen.getByText("No ranked agents yet")).toBeInTheDocument();
  });
  it("renders rows when ready", () => {
    render(<LeaderboardView status="ready" rows={rows} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
  });
  it("re-sorts when sort control changes", async () => {
    render(<LeaderboardView status="ready" rows={rows} />);
    await userEvent.selectOptions(screen.getByLabelText("sort by"), "cumulativePnl");
    const firstRow = screen.getByTestId("leader-2"); // beta keeps rank field 2 but appears first
    expect(firstRow).toHaveTextContent("beta");
  });
  it("highlights current agent rank", () => {
    render(<LeaderboardView status="ready" rows={rows} currentAgentId="alpha" />);
    expect(screen.getByTestId("your-rank")).toHaveTextContent("#1");
  });
  it("no highlight when current agent absent", () => {
    render(<LeaderboardView status="ready" rows={rows} currentAgentId="zeta" />);
    expect(screen.queryByTestId("your-rank")).not.toBeInTheDocument();
  });
});
