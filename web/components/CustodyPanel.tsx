import React, { useState } from "react";
import { validateAmount, equity, type Balance, type CustodyAction } from "../lib/custody";
import { money } from "../lib/format";

export interface CustodyPanelProps {
  balance: Balance;
  canWithdraw: boolean;
  onSubmit: (action: CustodyAction, amount: number) => void;
}

export function CustodyPanel({ balance, canWithdraw, onSubmit }: CustodyPanelProps) {
  const [action, setAction] = useState<CustodyAction>("deposit");
  const [amount, setAmount] = useState("");
  const result = validateAmount(action, amount, balance, canWithdraw);

  return (
    <section className="custody" aria-label="Custody">
      <h2>Funds</h2>
      <div className="balances">
        <span data-testid="available">Available {money(balance.available)}</span>
        <span data-testid="locked">Locked {money(balance.locked)}</span>
        <span data-testid="equity">Equity {money(equity(balance))}</span>
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={action === "deposit"} onClick={() => setAction("deposit")}>Deposit</button>
        <button role="tab" aria-selected={action === "withdraw"} onClick={() => setAction("withdraw")}>Withdraw</button>
      </div>
      <input
        aria-label="amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0.00"
        inputMode="decimal"
      />
      {!result.valid && amount !== "" && <span className="err" role="alert">{result.reason}</span>}
      <button
        disabled={!result.valid}
        onClick={() => result.valid && onSubmit(action, Number(amount))}
      >
        {action === "deposit" ? "Deposit" : "Withdraw"}
      </button>
    </section>
  );
}
