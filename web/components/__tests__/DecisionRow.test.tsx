import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DecisionRow, actionLabel } from "../DecisionRow";

describe("actionLabel", () => {
  it("maps actions", () => {
    expect(actionLabel(1)).toBe("LONG");
    expect(actionLabel(-1)).toBe("SHORT");
    expect(actionLabel(0)).toBe("HOLD");
  });
});

describe("DecisionRow", () => {
  it("renders a long decision", () => {
    render(<DecisionRow seq={3} action={1} size={10} rationale="trend up" />);
    expect(screen.getByText("LONG")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("trend up")).toBeInTheDocument();
  });
  it("shows positive pnl with + and pos class", () => {
    render(<DecisionRow seq={1} action={1} size={5} rationale="x" pnl={20} />);
    expect(screen.getByText("+20")).toHaveClass("pos");
  });
  it("shows negative pnl with neg class", () => {
    render(<DecisionRow seq={1} action={-1} size={5} rationale="x" pnl={-8} />);
    expect(screen.getByText("-8")).toHaveClass("neg");
  });
  it("omits pnl when undefined", () => {
    render(<DecisionRow seq={1} action={0} size={0} rationale="hold" />);
    expect(screen.queryByText(/^[+-]/)).not.toBeInTheDocument();
  });
  it("has no a11y violations within its list container", async () => {
    // listitem requires a list parent; test in the real usage context.
    const { container } = render(
      <div role="list">
        <DecisionRow seq={1} action={1} size={5} rationale="x" pnl={1} />
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
