import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DecisionDetailView } from "../DecisionDetail";
import type { DecisionDetail } from "../../lib/decisionDetail";

const base: DecisionDetail = { seq: 7, action: 1, size: 10, signalHash: "0x1234567890ab", rationaleHash: "0xdef", settled: false };
const EXP = "https://explorer.mantle.xyz";

describe("DecisionDetailView", () => {
  it("renders action, size, short signal hash", () => {
    render(<DecisionDetailView detail={base} explorerBase={EXP} />);
    expect(screen.getByText("LONG")).toBeInTheDocument();
    expect(screen.getByText("0x1234…90ab")).toBeInTheDocument();
  });
  it("shows pending rationale when unresolved", () => {
    render(<DecisionDetailView detail={base} explorerBase={EXP} />);
    expect(screen.getByTestId("rationale-pending")).toBeInTheDocument();
  });
  it("shows resolved rationale", () => {
    render(<DecisionDetailView detail={{ ...base, rationale: "momentum strong" }} explorerBase={EXP} />);
    expect(screen.getByText("momentum strong")).toBeInTheDocument();
  });
  it("status badge reflects lifecycle", () => {
    const { rerender } = render(<DecisionDetailView detail={base} explorerBase={EXP} />);
    expect(screen.getByTestId("status")).toHaveTextContent("pending");
    rerender(<DecisionDetailView detail={{ ...base, txHash: "0xaaaabbbbcccc" }} explorerBase={EXP} />);
    expect(screen.getByTestId("status")).toHaveTextContent("open");
    rerender(<DecisionDetailView detail={{ ...base, settled: true, pnl: 25 }} explorerBase={EXP} />);
    expect(screen.getByTestId("status")).toHaveTextContent("settled");
  });
  it("shows pnl only when settled", () => {
    const { rerender } = render(<DecisionDetailView detail={base} explorerBase={EXP} />);
    expect(screen.queryByTestId("pnl")).not.toBeInTheDocument();
    rerender(<DecisionDetailView detail={{ ...base, settled: true, pnl: -5 }} explorerBase={EXP} />);
    expect(screen.getByTestId("pnl")).toHaveTextContent("-5");
  });
  it("renders explorer link with built url", () => {
    render(<DecisionDetailView detail={{ ...base, txHash: "0xaaaabbbbcccc" }} explorerBase={EXP} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://explorer.mantle.xyz/tx/0xaaaabbbbcccc");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
  it("no explorer link without tx", () => {
    render(<DecisionDetailView detail={base} explorerBase={EXP} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<DecisionDetailView detail={{ ...base, settled: true, pnl: 10, txHash: "0xaaaabbbbcccc", rationale: "x" }} explorerBase={EXP} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
