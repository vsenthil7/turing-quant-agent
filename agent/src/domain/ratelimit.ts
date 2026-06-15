/** Token-bucket rate limiting + LLM cost-budget enforcement. Pure; caller
 *  supplies the clock and persists bucket state. */

export interface Bucket {
  tokens: number;
  capacity: number;
  refillPerSec: number;
  lastRefill: number;
}

/** Refill then attempt to consume `cost` tokens. Returns updated bucket + allowed. */
export function consume(bucket: Bucket, cost: number, now: number): { bucket: Bucket; allowed: boolean } {
  if (cost < 0) throw new Error("NEGATIVE_COST");
  const elapsed = Math.max(0, now - bucket.lastRefill);
  const refilled = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillPerSec);
  if (refilled >= cost) {
    return { bucket: { ...bucket, tokens: refilled - cost, lastRefill: now }, allowed: true };
  }
  return { bucket: { ...bucket, tokens: refilled, lastRefill: now }, allowed: false };
}

export interface Budget { spent: number; limit: number; }

/** Enforce a hard spend cap (e.g. LLM USD per day). */
export function charge(budget: Budget, amount: number): { budget: Budget; allowed: boolean } {
  if (amount < 0) throw new Error("NEGATIVE_AMOUNT");
  if (budget.spent + amount > budget.limit) {
    return { budget, allowed: false };
  }
  return { budget: { ...budget, spent: budget.spent + amount }, allowed: true };
}
