/** Position lifecycle state machine. Pure, deterministic. */

export type Side = "long" | "short";
export interface Position {
  side: Side;
  size: number;
  entryPrice: number;
  open: boolean;
}

/** Open a position. */
export function openPosition(side: Side, size: number, entryPrice: number): Position {
  if (size <= 0) throw new RangeError("size must be > 0");
  if (entryPrice <= 0) throw new RangeError("entryPrice must be > 0");
  return { side, size, entryPrice, open: true };
}

/** Unrealized PnL at a given mark price. */
export function unrealizedPnl(p: Position, markPrice: number): number {
  if (!p.open) return 0;
  const dir = p.side === "long" ? 1 : -1;
  return dir * (markPrice - p.entryPrice) * p.size;
}

/** Close a position, realizing PnL at exit price. */
export function closePosition(p: Position, exitPrice: number): { closed: Position; realizedPnl: number } {
  if (!p.open) throw new Error("ALREADY_CLOSED");
  if (exitPrice <= 0) throw new RangeError("exitPrice must be > 0");
  const dir = p.side === "long" ? 1 : -1;
  const realizedPnl = dir * (exitPrice - p.entryPrice) * p.size;
  return { closed: { ...p, open: false }, realizedPnl };
}

/** Apply an action to current position: may open, close, flip, or hold. */
export function transition(
  current: Position | null,
  action: -1 | 0 | 1,
  size: number,
  price: number
): { position: Position | null; realizedPnl: number } {
  const desiredSide: Side | null = action === 1 ? "long" : action === -1 ? "short" : null;

  if (desiredSide === null) {
    // hold/flat: close any open position
    if (current?.open) {
      const { closed, realizedPnl } = closePosition(current, price);
      return { position: closed, realizedPnl };
    }
    return { position: current, realizedPnl: 0 };
  }

  if (!current || !current.open) {
    return { position: openPosition(desiredSide, size, price), realizedPnl: 0 };
  }

  if (current.side === desiredSide) {
    return { position: current, realizedPnl: 0 }; // already in desired direction
  }

  // flip: close then open opposite
  const { realizedPnl } = closePosition(current, price);
  return { position: openPosition(desiredSide, size, price), realizedPnl };
}
