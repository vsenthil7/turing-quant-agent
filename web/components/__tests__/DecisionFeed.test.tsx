import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DecisionFeed, feedSummary } from "../DecisionFeed";

const sample = [
  { seq: 0, action: 1 as const, size: 10, rationale: "trend up", pnl: 5 },
  { seq: 1, action: 0 as const, size: 0, rationale: "flat" },
  { seq: 2, action: -1 as const, size: 8, rationale: "reverse", pnl: -3 }
];

describe("DecisionFeed", () => {
  it("shows empty state with no decisions", () => {
    render(<DecisionFeed decisions={[]} />);
    expect(screen.getByText("No decisions yet")).toBeInTheDocument();
  });
  it("renders a row per decision", () => {
    render(<DecisionFeed decisions={sample} />);
    expect(screen.getByTestId("decision-0")).toBeInTheDocument();
    expect(screen.getByTestId("decision-2")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("is an accessible list", () => {
    render(<DecisionFeed decisions={sample} />);
    expect(screen.getByRole("list", { name: "Decision feed" })).toBeInTheDocument();
  });
  it("has no a11y violations populated", async () => {
    const { container } = render(<DecisionFeed decisions={sample} />);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("has no a11y violations empty", async () => {
    const { container } = render(<DecisionFeed decisions={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("feedSummary", () => {
  it("counts by action", () => {
    expect(feedSummary(sample)).toEqual({ total: 3, longs: 1, shorts: 1, holds: 1 });
  });
  it("handles empty", () => {
    expect(feedSummary([])).toEqual({ total: 0, longs: 0, shorts: 0, holds: 0 });
  });
});
