/** Pure view-model for a single decision's detail. */
export interface DecisionDetail {
  seq: number;
  action: -1 | 0 | 1;
  size: number;
  signalHash: string;
  rationaleHash: string;
  rationale?: string;     // resolved from provenance (may be pending)
  pnl?: number;
  settled: boolean;
  txHash?: string;
}

export function actionWord(a: -1 | 0 | 1): string {
  return a === 1 ? "LONG" : a === -1 ? "SHORT" : "HOLD";
}

/** Status label for a decision. */
export function statusLabel(d: DecisionDetail): "settled" | "open" | "pending" {
  if (d.settled) return "settled";
  return d.txHash ? "open" : "pending";
}

/** Build an explorer URL for a tx (chain base injected). */
export function explorerUrl(base: string, txHash: string): string {
  return `${base.replace(/\/$/, "")}/tx/${txHash}`;
}

/** Short-hash display (0x1234…abcd). */
export function shortHash(h: string): string {
  if (h.length <= 12) return h;
  return `${h.slice(0, 6)}…${h.slice(-4)}`;
}
