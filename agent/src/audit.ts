/** Append-only in-memory audit trail of pipeline events (mirrors on-chain log). */

export type AuditEvent =
  | { kind: "signal"; seq: number; score: number }
  | { kind: "macro"; seq: number; regime: string }
  | { kind: "decision"; seq: number; action: number; size: number }
  | { kind: "risk-reject"; seq: number; reason: string }
  | { kind: "executed"; seq: number; decisionId: number }
  | { kind: "error"; seq: number; message: string };

export class AuditTrail {
  private events: AuditEvent[] = [];
  record(e: AuditEvent): void { this.events.push(e); }
  all(): readonly AuditEvent[] { return this.events; }
  byKind(kind: AuditEvent["kind"]): AuditEvent[] { return this.events.filter(e => e.kind === kind); }
  count(): number { return this.events.length; }
}
