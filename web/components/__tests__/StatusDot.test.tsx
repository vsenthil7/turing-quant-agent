import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatusDot } from "../StatusDot";

describe("StatusDot", () => {
  it.each([
    ["ok", "Healthy"],
    ["degraded", "Degraded"],
    ["down", "Down"]
  ] as const)("renders %s with accessible label %s", (status, label) => {
    render(<StatusDot status={status} />);
    expect(screen.getByRole("status", { name: label })).toBeInTheDocument();
  });
  it("applies status class", () => {
    const { container } = render(<StatusDot status="ok" />);
    expect(container.querySelector(".dot")).toHaveClass("ok");
  });
  it("has no a11y violations for each state", async () => {
    for (const s of ["ok", "degraded", "down"] as const) {
      const { container } = render(<StatusDot status={s} />);
      expect(await axe(container)).toHaveNoViolations();
    }
  });
});
