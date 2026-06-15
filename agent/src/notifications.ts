/** Notification model: domain events -> notification payloads. Pure.
 *  Delivery (push/email/webhook) is injected in Desktop; routing is here. */
import type { DomainEvent } from "./events.js";

export type Channel = "push" | "email" | "webhook";
export interface Notification {
  channel: Channel;
  title: string;
  body: string;
  priority: "low" | "normal" | "high";
}

export interface NotificationPrefs {
  onDecision: boolean;
  onSettle: boolean;
  onHalt: boolean;
  channels: Channel[];
}

/** Map a domain event to notifications per user prefs. Returns [] if muted. */
export function notify(event: DomainEvent, prefs: NotificationPrefs): Notification[] {
  const make = (title: string, body: string, priority: Notification["priority"]): Notification[] =>
    prefs.channels.map(channel => ({ channel, title, body, priority }));

  switch (event.type) {
    case "DecisionMade":
      if (!prefs.onDecision || event.action === 0) return [];
      return make("Trade decision", `${event.action === 1 ? "LONG" : "SHORT"} size ${event.size}`, "normal");
    case "TradeSettled":
      if (!prefs.onSettle) return [];
      return make("Trade settled", `PnL ${event.pnl >= 0 ? "+" : ""}${event.pnl}`, event.pnl < 0 ? "high" : "normal");
    case "Halted":
      if (!prefs.onHalt) return [];
      return make("Agent halted", `reason: ${event.reason}`, "high");
    default:
      return [];
  }
}
