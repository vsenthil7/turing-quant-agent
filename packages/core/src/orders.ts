/** Order types + trigger logic. Pure. */

export type OrderKind = "market" | "limit" | "stop";
export interface Order {
  kind: OrderKind;
  side: "buy" | "sell";
  size: number;
  limitPrice?: number; // for limit
  stopPrice?: number;  // for stop
}

/** Validate an order's structural integrity. Throws on invalid. */
export function validateOrder(o: Order): void {
  if (o.size <= 0) throw new RangeError("size must be > 0");
  if (o.kind === "limit" && (o.limitPrice === undefined || o.limitPrice <= 0)) {
    throw new Error("LIMIT_REQUIRES_PRICE");
  }
  if (o.kind === "stop" && (o.stopPrice === undefined || o.stopPrice <= 0)) {
    throw new Error("STOP_REQUIRES_PRICE");
  }
}

/** Should this order trigger/fill at the current market price? */
export function shouldTrigger(o: Order, marketPrice: number): boolean {
  validateOrder(o);
  switch (o.kind) {
    case "market":
      return true;
    case "limit":
      // buy limit fills at or below limit; sell limit at or above
      return o.side === "buy" ? marketPrice <= o.limitPrice! : marketPrice >= o.limitPrice!;
    case "stop":
      // buy stop triggers at or above stop; sell stop at or below
      return o.side === "buy" ? marketPrice >= o.stopPrice! : marketPrice <= o.stopPrice!;
  }
}
