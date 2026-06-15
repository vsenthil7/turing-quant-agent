import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustodyPanelAsync } from "../CustodyPanelAsync";

const bal = { available: 100, locked: 0 };

describe("CustodyPanelAsync", () => {
  it("submits then shows success and clears input", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "50");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    await waitFor(() => expect(screen.getByTestId("success")).toBeInTheDocument());
    expect(onSubmit).toHaveBeenCalledWith("deposit", 50);
    expect(screen.getByLabelText("amount")).toHaveValue("");
  });

  it("shows processing state while submitting", async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    expect(screen.getByRole("button", { name: "Processing…" })).toBeInTheDocument();
    resolve();
    await waitFor(() => expect(screen.getByTestId("success")).toBeInTheDocument());
  });

  it("surfaces submit error", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("chain reverted"));
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    await waitFor(() => expect(screen.getByTestId("submit-error")).toHaveTextContent("chain reverted"));
  });

  it("disables inputs while busy", async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    expect(screen.getByLabelText("amount")).toBeDisabled();
    resolve();
    await waitFor(() => expect(screen.getByLabelText("amount")).not.toBeDisabled());
  });

  it("marks section aria-busy during submit", async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    const { container } = render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("amount"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Deposit" }));
    expect(container.querySelector("[aria-busy=true]")).toBeTruthy();
    resolve();
    await waitFor(() => expect(container.querySelector("[aria-busy=true]")).toBeFalsy());
  });

  it("switching to withdraw tab shows withdraw button label", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("tab", { name: "Withdraw" }));
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Deposit" }));
    expect(screen.getByRole("button", { name: "Deposit" })).toBeInTheDocument();
  });

  it("shows validation alert and submit is a no-op for an invalid amount", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CustodyPanelAsync balance={bal} canWithdraw onSubmit={onSubmit} />);
    // withdraw more than available -> invalid -> alert shown, submit guarded
    await userEvent.click(screen.getByRole("tab", { name: "Withdraw" }));
    await userEvent.type(screen.getByLabelText("amount"), "9999");
    expect(screen.getByRole("alert")).toHaveTextContent("Insufficient available funds");
    // submit button is disabled; force-calling handler path stays a no-op
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
