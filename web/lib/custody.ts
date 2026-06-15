/** Pure custody form logic. Validation + state transitions, no UI. */

export interface Balance { available: number; locked: number; }

export type CustodyAction = "deposit" | "withdraw";

export type ValidationResult = { valid: true } | { valid: false; reason: string };

/** Validate a deposit/withdraw amount against balance + role. */
export function validateAmount(
  action: CustodyAction,
  amountStr: string,
  balance: Balance,
  canWithdraw: boolean
): ValidationResult {
  const amount = Number(amountStr);
  if (amountStr.trim() === "" || Number.isNaN(amount)) return { valid: false, reason: "Enter a number" };
  if (amount <= 0) return { valid: false, reason: "Amount must be positive" };
  if (!Number.isFinite(amount)) return { valid: false, reason: "Amount must be finite" };
  if (action === "withdraw") {
    if (!canWithdraw) return { valid: false, reason: "You lack withdraw permission" };
    if (amount > balance.available) return { valid: false, reason: "Insufficient available funds" };
  }
  return { valid: true };
}

export function equity(b: Balance): number { return b.available + b.locked; }
