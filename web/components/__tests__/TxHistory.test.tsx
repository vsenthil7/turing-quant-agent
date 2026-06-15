import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TxHistory } from "../TxHistory";
import type { Tx } from "../../lib/txHistory";

const txs: Tx[] = [
  { id: "1", type: "deposit", amount: 100, timestamp: 1 },
  { id: "2", type: "fee", amount: 5, timestamp: 2 },
  { id: "3", type: "withdraw", amount: 30, timestamp: 3 }
];

describe("TxHistory", () => {
  it("empty state when no txs", () => {
    render(<TxHistory txs={[]} />);
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });
  it("renders rows with running balance", () => {
    render(<TxHistory txs={txs} />);
    expect(screen.getByTestId("tx-1")).toHaveTextContent("100");
    expect(screen.getByTestId("tx-3")).toHaveTextContent("65"); // 100-5-30
  });
  it("color-codes signed amounts", () => {
    render(<TxHistory txs={txs} />);
    expect(screen.getByTestId("tx-1")).toHaveTextContent("+");
    expect(screen.getByTestId("tx-2").querySelector(".neg")).toBeTruthy();
  });
  it("filters by type", async () => {
    render(<TxHistory txs={txs} />);
    await userEvent.selectOptions(screen.getByLabelText("filter type"), "deposit");
    expect(screen.getByTestId("tx-1")).toBeInTheDocument();
    expect(screen.queryByTestId("tx-2")).not.toBeInTheDocument();
  });
  it("filter to empty type shows empty state", async () => {
    render(<TxHistory txs={[txs[0]!]} />);
    await userEvent.selectOptions(screen.getByLabelText("filter type"), "pnl");
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<TxHistory txs={txs} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
