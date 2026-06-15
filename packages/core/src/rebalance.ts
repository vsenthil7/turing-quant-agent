/** Portfolio rebalancing: diff current vs target weights -> orders. Pure. */
import type { Allocation } from "./portfolio.js";

export interface RebalanceOrder { asset: string; deltaWeight: number; side: "buy" | "sell"; }

/** Compute orders to move from current allocation to target, ignoring dust. */
export function rebalance(current: Allocation[], target: Allocation[], dust = 0.001): RebalanceOrder[] {
  const cur = new Map(current.map(a => [a.asset, a.weight]));
  const tgt = new Map(target.map(a => [a.asset, a.weight]));
  const assets = new Set([...cur.keys(), ...tgt.keys()]);
  const orders: RebalanceOrder[] = [];
  for (const asset of assets) {
    const delta = (tgt.get(asset) ?? 0) - (cur.get(asset) ?? 0);
    if (Math.abs(delta) < dust) continue;
    orders.push({ asset, deltaWeight: Math.abs(delta), side: delta > 0 ? "buy" : "sell" });
  }
  return orders.sort((a, b) => a.asset.localeCompare(b.asset));
}

/** Turnover = sum of absolute weight changes (rebalancing cost proxy). */
export function turnover(orders: RebalanceOrder[]): number {
  return orders.reduce((a, o) => a + o.deltaWeight, 0);
}
