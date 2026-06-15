import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BacktestResults } from "../BacktestResults";
import type { BacktestResultView } from "../../lib/backtestView";

const result: BacktestResultView = {
  report: { totalReturn: 0.25, sharpe: 1.8, sortino: 2.1, maxDrawdown: 0.12, winRate: 0.58, streaks: { longestWin: 4, longestLoss: 2 } },
  trades: 42,
  equityCurve: [1000, 1050, 1030, 1100, 1250]
};

describe("BacktestResults", () => {
  it("renders headline metrics", () => {
    render(<BacktestResults result={result} />);
    expect(screen.getByTestId("total-return")).toHaveTextContent("25.0%");
    expect(screen.getByTestId("sharpe")).toHaveTextContent("1.80");
    expect(screen.getByTestId("max-dd")).toHaveTextContent("12.0%");
  });
  it("grades the result", () => {
    render(<BacktestResults result={result} />);
    expect(screen.getByTestId("grade")).toHaveTextContent("strong");
  });
  it("colors total return by sign", () => {
    const losing = { ...result, report: { ...result.report, totalReturn: -0.1 } };
    render(<BacktestResults result={losing} />);
    expect(screen.getByTestId("total-return")).toHaveClass("neg");
  });
  it("renders the equity curve as an accessible image", () => {
    render(<BacktestResults result={result} />);
    expect(screen.getByRole("img", { name: "Equity curve" })).toBeInTheDocument();
  });
  it("shows fallback when curve too short", () => {
    render(<BacktestResults result={{ ...result, equityCurve: [1000] }} />);
    expect(screen.getByTestId("no-curve")).toBeInTheDocument();
  });
  it("shows trade count + streaks", () => {
    render(<BacktestResults result={result} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<BacktestResults result={result} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
