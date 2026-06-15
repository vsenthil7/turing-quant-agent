/** Pure notification-preference logic, mirrors agent/src/notifications.ts. */
export type Channel = "push" | "email" | "webhook";
export interface NotificationPrefs {
  onDecision: boolean;
  onSettle: boolean;
  onHalt: boolean;
  channels: Channel[];
}

export const DEFAULT_PREFS: NotificationPrefs = { onDecision: true, onSettle: true, onHalt: true, channels: ["push"] };

export function toggleChannel(prefs: NotificationPrefs, channel: Channel): NotificationPrefs {
  const has = prefs.channels.includes(channel);
  return { ...prefs, channels: has ? prefs.channels.filter(c => c !== channel) : [...prefs.channels, channel] };
}

export function setEvent(prefs: NotificationPrefs, key: "onDecision" | "onSettle" | "onHalt", value: boolean): NotificationPrefs {
  return { ...prefs, [key]: value };
}

/** Valid prefs require at least one channel if any event is enabled. */
export function validatePrefs(prefs: NotificationPrefs): { valid: true } | { valid: false; reason: string } {
  const anyEvent = prefs.onDecision || prefs.onSettle || prefs.onHalt;
  if (anyEvent && prefs.channels.length === 0) {
    return { valid: false, reason: "Select at least one channel" };
  }
  return { valid: true };
}
