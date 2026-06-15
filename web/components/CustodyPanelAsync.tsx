import React, { useState } from "react";
import { validateAmount, equity, type Balance, type CustodyAction } from "../lib/custody";
import { money } from "../lib/format";

export type SubmitState = "idle" | "submitting" | "success" | "error";

export interface CustodyPanelAsyncProps {
  balance: Balance;
  canWithdraw: boolean;
  onSubmit: (action: CustodyAction, amount: number) => Promise<void>;
}

export function CustodyPanelAsync({ balance, canWithdraw, onSubmit }: CustodyPanelAsyncProps) {
  const [action, setAction] = useState<CustodyAction>("deposit");
  const [amount, setAmount] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validation = validateAmount(action, amount, balance, canWithdraw);
  const busy = submitState === "submitting";

  const handleSubmit = async () => {
    if (!validation.valid) return;
    setSubmitState("submitting");
    setErrorMsg("");
    try {
      await onSubmit(action, Number(amount));
      setSubmitState("success");
      setAmount("");
    } catch (e) {
      setSubmitState("error");
      setErrorMsg((e as Error).message);
    }
  };

  return (
    <section className="custody" aria-label="Custody" aria-busy={busy}>
      <h2>Funds</h2>
      <div className="balances">
        <span data-testid="available">Available {money(balance.available)}</span>
        <span data-testid="equity">Equity {money(equity(balance))}</span>
      </div>
      <div role="tablist">
        <button role="tab" aria-selected={action === "deposit"} onClick={() => setAction("deposit")} disabled={busy}>Deposit</button>
        <button role="tab" aria-selected={action === "withdraw"} onClick={() => setAction("withdraw")} disabled={busy}>Withdraw</button>
      </div>
      <input aria-label="amount" value={amount} onChange={e => setAmount(e.target.value)} disabled={busy} inputMode="decimal" />
      {!validation.valid && amount !== "" && <span className="err" role="alert">{validation.reason}</span>}
      {submitState === "success" && <span className="ok" role="status" data-testid="success">Done</span>}
      {submitState === "error" && <span className="err" role="alert" data-testid="submit-error">{errorMsg}</span>}
      <button disabled={!validation.valid || busy} onClick={handleSubmit}>
        {busy ? "Processing…" : action === "deposit" ? "Deposit" : "Withdraw"}
      </button>
    </section>
  );
}
