import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AsyncBoundary } from "../AsyncBoundary";

describe("AsyncBoundary", () => {
  it("shows loading with busy status", () => {
    render(<AsyncBoundary status="loading"><div>data</div></AsyncBoundary>);
    const s = screen.getByRole("status");
    expect(s).toHaveAttribute("aria-busy", "true");
  });
  it("shows error with default message", () => {
    render(<AsyncBoundary status="error"><div>data</div></AsyncBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });
  it("shows custom error", () => {
    render(<AsyncBoundary status="error" error="API 500"><div>data</div></AsyncBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("API 500");
  });
  it("retry button fires callback", async () => {
    const onRetry = vi.fn();
    render(<AsyncBoundary status="error" onRetry={onRetry}><div>data</div></AsyncBoundary>);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });
  it("no retry button when no handler", () => {
    render(<AsyncBoundary status="error"><div>data</div></AsyncBoundary>);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });
  it("shows empty state when ready+empty", () => {
    render(<AsyncBoundary status="ready" isEmpty emptyMessage="No rows"><div>data</div></AsyncBoundary>);
    expect(screen.getByText("No rows")).toBeInTheDocument();
  });
  it("renders children when ready+non-empty", () => {
    render(<AsyncBoundary status="ready"><div>real data</div></AsyncBoundary>);
    expect(screen.getByText("real data")).toBeInTheDocument();
  });
  it("no a11y violations across states", async () => {
    for (const status of ["loading", "error", "ready"] as const) {
      const { container } = render(<AsyncBoundary status={status} error="e"><div>x</div></AsyncBoundary>);
      expect(await axe(container)).toHaveNoViolations();
    }
  });
});
