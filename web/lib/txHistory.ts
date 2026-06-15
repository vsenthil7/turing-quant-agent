/** Pure transaction-history logic: formatting + filtering + running balance. */
export type TxType = "deposit" | "withdraw" | "fee" | "pnl";
export interface Tx { id: string; type: TxType; amount: number; timestamp: number; }

/** Signed effect of a tx on balance. */
export function signedAmount(tx: Tx): number {
  return tx.type === "deposit" || tx.type === "pnl" ? tx.amount : -tx.amount;
}

/** Running balance after each tx (chronological). */
export function runningBalance(txs: Tx[], opening = 0): { tx: Tx; balance: number }[] {
  let bal = opening;
  return [...txs].sort((a, b) => a.timestamp - b.timestamp).map(tx => {
    bal += signedAmount(tx);
    return { tx, balance: bal };
  });
}

/** Filter by type; "all" returns everything. */
export function filterTx(txs: Tx[], type: TxType | "all"): Tx[] {
  return type === "all" ? txs : txs.filter(t => t.type === type);
}
