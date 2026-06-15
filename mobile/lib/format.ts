export function pct(x: number): string { return `${(x * 100).toFixed(2)}%`; }
export function money(x: number): string {
  const sign = x < 0 ? "-" : "";
  return `${sign}$${Math.abs(x).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
export function statusText(halted: boolean): string { return halted ? "HALTED" : "RUNNING"; }
export function modeText(aiMode: string | undefined, dryRun: boolean | undefined): string {
  return `${aiMode ?? "—"} ${dryRun ? "· dry-run" : "· live"}`;
}
