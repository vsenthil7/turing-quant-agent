/** Structured logging + metrics. Sink is injectable for testability. */

export type Level = "debug" | "info" | "warn" | "error";
export interface LogRecord { ts: number; level: Level; msg: string; fields: Record<string, unknown>; }
export interface Sink { write(r: LogRecord): void; }

export class Logger {
  constructor(private sink: Sink, private clock: () => number = Date.now) {}
  private emit(level: Level, msg: string, fields: Record<string, unknown> = {}): void {
    this.sink.write({ ts: this.clock(), level, msg, fields });
  }
  debug(m: string, f?: Record<string, unknown>) { this.emit("debug", m, f); }
  info(m: string, f?: Record<string, unknown>) { this.emit("info", m, f); }
  warn(m: string, f?: Record<string, unknown>) { this.emit("warn", m, f); }
  error(m: string, f?: Record<string, unknown>) { this.emit("error", m, f); }
}

/** Simple counter/gauge metrics registry. */
export class Metrics {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  inc(name: string, by = 1): void { this.counters.set(name, (this.counters.get(name) ?? 0) + by); }
  gauge(name: string, value: number): void { this.gauges.set(name, value); }
  snapshot(): { counters: Record<string, number>; gauges: Record<string, number> } {
    return { counters: Object.fromEntries(this.counters), gauges: Object.fromEntries(this.gauges) };
  }
}

export type Health = { status: "ok" | "degraded" | "down"; checks: Record<string, boolean> };
export function health(checks: Record<string, boolean>): Health {
  const values = Object.values(checks);
  if (values.length === 0 || values.every(Boolean)) return { status: "ok", checks };
  if (values.some(Boolean)) return { status: "degraded", checks };
  return { status: "down", checks };
}
