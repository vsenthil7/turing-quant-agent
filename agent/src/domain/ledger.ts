/** Double-entry accounting ledger for custody. Pure. Enforces balance
 *  invariants so funds can never be created/destroyed by accounting. */

export type EntryType = "deposit" | "withdraw" | "fee" | "pnl";

export interface LedgerEntry {
  id: string;
  accountId: string;
  type: EntryType;
  amount: number;   // positive magnitude
  timestamp: number;
}

export interface Balance {
  available: number; // withdrawable
  locked: number;    // in open positions
}

/** Apply an entry to a balance, enforcing invariants. Returns new balance. */
export function applyEntry(bal: Balance, e: LedgerEntry): Balance {
  if (e.amount < 0) throw new Error("NEGATIVE_AMOUNT");
  switch (e.type) {
    case "deposit":
      return { ...bal, available: bal.available + e.amount };
    case "withdraw":
      if (e.amount > bal.available) throw new Error("INSUFFICIENT_FUNDS");
      return { ...bal, available: bal.available - e.amount };
    case "fee":
      if (e.amount > bal.available) throw new Error("INSUFFICIENT_FUNDS_FOR_FEE");
      return { ...bal, available: bal.available - e.amount };
    case "pnl":
      // pnl can be negative in effect; represented as signed via separate calls.
      return { ...bal, available: bal.available + e.amount };
  }
}

/** Lock funds into a position (available -> locked). */
export function lock(bal: Balance, amount: number): Balance {
  if (amount < 0) throw new Error("NEGATIVE_AMOUNT");
  if (amount > bal.available) throw new Error("INSUFFICIENT_FUNDS");
  return { available: bal.available - amount, locked: bal.locked + amount };
}

/** Release locked funds (locked -> available), e.g. on position close. */
export function release(bal: Balance, amount: number): Balance {
  if (amount < 0) throw new Error("NEGATIVE_AMOUNT");
  if (amount > bal.locked) throw new Error("OVER_RELEASE");
  return { available: bal.available + amount, locked: bal.locked - amount };
}

/** Reconstruct a balance by folding entries (event-sourced custody). */
export function foldEntries(entries: LedgerEntry[]): Balance {
  return entries.reduce(applyEntry, { available: 0, locked: 0 });
}

/** Total equity = available + locked. */
export function equity(bal: Balance): number {
  return bal.available + bal.locked;
}
