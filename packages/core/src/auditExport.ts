/** Deterministic audit/report export. Pure: data -> CSV/JSON string. */

export interface ExportRow { [k: string]: string | number | boolean; }

/** Render rows to CSV with a stable column order (sorted keys of first row). */
export function toCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]!).sort();
  const header = cols.join(",");
  const body = rows.map(r => cols.map(c => csvCell(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

function csvCell(v: string | number | boolean | undefined): string {
  if (v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Stable JSON (sorted keys) for reproducible audit artifacts. */
export function toStableJson(rows: ExportRow[]): string {
  return JSON.stringify(rows.map(sortKeys));
}

function sortKeys(row: ExportRow): ExportRow {
  const out: ExportRow = {};
  for (const k of Object.keys(row).sort()) out[k] = row[k]!;
  return out;
}
