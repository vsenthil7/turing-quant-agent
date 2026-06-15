export function pct(x: number): string { return `${(x * 100).toFixed(2)}%`; }
export function money(x: number): string {
  const sign = x < 0 ? "-" : "";
  return `${sign}$${Math.abs(x).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
export function pnlClass(x: number): "pos" | "neg" | "flat" {
  return x > 0 ? "pos" : x < 0 ? "neg" : "flat";
}
