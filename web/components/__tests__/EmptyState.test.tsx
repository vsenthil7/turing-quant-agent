import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="No decisions yet" />);
    expect(screen.getByText("No decisions yet")).toBeInTheDocument();
  });
  it("has note role", () => {
    render(<EmptyState message="x" />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });
  it("has no a11y violations", async () => {
    const { container } = render(<EmptyState message="x" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
