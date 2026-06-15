import React, { useState } from "react";
import { runningBalance, filterTx, signedAmount, type Tx, type TxType } from "../lib/txHistory";
import { money } from "../lib/format";
import { EmptyState } from "./EmptyState";

export interface TxHistoryProps { txs: Tx[]; opening?: number; }

export function TxHistory({ txs, opening = 0 }: TxHistoryProps) {
  const [filter, setFilter] = useState<TxType | "all">("all");
  const filtered = filterTx(txs, filter);
  const rows = runningBalance(filtered, opening);

  return (
    <section aria-label="Transaction history">
      <label>
        Filter
        <select aria-label="filter type" value={filter} onChange={e => setFilter(e.target.value as TxType | "all")}>
          <option value="all">All</option>
          <option value="deposit">Deposits</option>
          <option value="withdraw">Withdrawals</option>
          <option value="fee">Fees</option>
          <option value="pnl">PnL</option>
        </select>
      </label>
      {rows.length === 0 ? <EmptyState message="No transactions" /> : (
        <table aria-label="transactions">
          <thead><tr><th>Type</th><th>Amount</th><th>Balance</th></tr></thead>
          <tbody>
            {rows.map(({ tx, balance }) => (
              <tr key={tx.id} data-testid={`tx-${tx.id}`}>
                <td>{tx.type}</td>
                <td className={signedAmount(tx) >= 0 ? "pos" : "neg"}>{signedAmount(tx) >= 0 ? "+" : ""}{money(signedAmount(tx))}</td>
                <td>{money(balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
