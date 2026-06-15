import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CustodyPanel } from "../CustodyPanel";

const bal = { available: 100, locked: 20 };

describe("CustodyPanel", () => {
  it("shows balances", () => {
    render(<CustodyPanel balance={bal} canWithdraw onSubmit={() => {}} />);
    expect(screen.getByTestId("available")).toHaveTextContent("100");
    expect(screen.getByTestId("equity")).toHaveTextContent("120");
  });

  it("submit disabled until valid amount entered", async () => {
    render(<CustodyPanel balance={bal} canWithdraw onSubmit={() => {}} />);
    const btn = screen.getByRole("button", { name: "Deposit" });
    expect(btn).toBeDisabled();
    await userEvent.type(screen.getByLabelText("amount"), "50");
    expect(btn).toBeEnabled();
  });

  it("fires onSubmit with parsed amount", async () => {
    const onSubmit = vi.fn();
    render(<CustodyPanel balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "30");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    expect(onSubmit).toHaveBeenCalledWith("deposit", 30);
  });

  it("switching to withdraw without permission shows error + disables", async () => {
    render(<CustodyPanel balance={bal} canWithdraw={false} onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole("tab", { name: "Withdraw" }));
    await userEvent.type(screen.getByLabelText("amount"), "10");
    expect(screen.getByRole("alert")).toHaveTextContent("withdraw permission");
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  });

  it("withdraw over available shows insufficient funds", async () => {
    render(<CustodyPanel balance={bal} canWithdraw onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole("tab", { name: "Withdraw" }));
    await userEvent.type(screen.getByLabelText("amount"), "500");
    expect(screen.getByRole("alert")).toHaveTextContent("Insufficient");
  });

  it("no a11y violations", async () => {
    const { container } = render(<CustodyPanel balance={bal} canWithdraw onSubmit={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
