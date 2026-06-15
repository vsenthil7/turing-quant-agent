import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatCard, toneFor } from "../StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Equity" value="$1,000" />);
    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();
  });
  it("applies positive tone class", () => {
    render(<StatCard label="PnL" value="+$50" tone="pos" />);
    expect(screen.getByText("+$50")).toHaveClass("pos");
  });
  it("applies negative tone class", () => {
    render(<StatCard label="PnL" value="-$50" tone="neg" />);
    expect(screen.getByText("-$50")).toHaveClass("neg");
  });
  it("defaults to flat tone", () => {
    render(<StatCard label="X" value="0" />);
    expect(screen.getByText("0")).toHaveClass("flat");
  });
  it("uses custom testId when provided", () => {
    render(<StatCard label="X" value="1" testId="custom" />);
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });
  it("exposes an accessible group label", () => {
    render(<StatCard label="Equity" value="$1" />);
    expect(screen.getByRole("group", { name: "Equity" })).toBeInTheDocument();
  });
  it("has no a11y violations", async () => {
    const { container } = render(<StatCard label="Equity" value="$1,000" tone="pos" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("toneFor", () => {
  it("maps positive/negative/zero", () => {
    expect(toneFor(5)).toBe("pos");
    expect(toneFor(-5)).toBe("neg");
    expect(toneFor(0)).toBe("flat");
  });
});
