import React from "react";
import { toggleChannel, setEvent, validatePrefs, type NotificationPrefs as Prefs, type Channel } from "../lib/notifyPrefs";

export interface NotificationPrefsProps {
  prefs: Prefs;
  onChange: (prefs: Prefs) => void;
}

const CHANNELS: Channel[] = ["push", "email", "webhook"];
const EVENTS: { key: "onDecision" | "onSettle" | "onHalt"; label: string }[] = [
  { key: "onDecision", label: "On decision" },
  { key: "onSettle", label: "On settle" },
  { key: "onHalt", label: "On halt" }
];

export function NotificationPrefsPanel({ prefs, onChange }: NotificationPrefsProps) {
  const validation = validatePrefs(prefs);
  return (
    <section aria-label="Notification preferences">
      <h2>Notifications</h2>
      <fieldset>
        <legend>Events</legend>
        {EVENTS.map(e => (
          <label key={e.key}>
            <input type="checkbox" checked={prefs[e.key]} onChange={ev => onChange(setEvent(prefs, e.key, ev.target.checked))} />
            {e.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Channels</legend>
        {CHANNELS.map(c => (
          <label key={c}>
            <input type="checkbox" checked={prefs.channels.includes(c)} onChange={() => onChange(toggleChannel(prefs, c))} />
            {c}
          </label>
        ))}
      </fieldset>
      {!validation.valid && <span className="err" role="alert">{validation.reason}</span>}
    </section>
  );
}
