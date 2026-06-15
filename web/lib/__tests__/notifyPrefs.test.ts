import { describe, it, expect } from "vitest";
import { DEFAULT_PREFS, toggleChannel, setEvent, validatePrefs } from "../notifyPrefs";

describe("toggleChannel", () => {
  it("removes an enabled channel", () => expect(toggleChannel(DEFAULT_PREFS, "push").channels).not.toContain("push"));
  it("adds a disabled channel", () => expect(toggleChannel(DEFAULT_PREFS, "email").channels).toContain("email"));
});
describe("setEvent", () => {
  it("sets event flags", () => {
    expect(setEvent(DEFAULT_PREFS, "onDecision", false).onDecision).toBe(false);
    expect(setEvent(DEFAULT_PREFS, "onHalt", false).onHalt).toBe(false);
  });
});
describe("validatePrefs", () => {
  it("valid with channel + events", () => expect(validatePrefs(DEFAULT_PREFS).valid).toBe(true));
  it("invalid: events on, no channels", () => {
    expect(validatePrefs({ ...DEFAULT_PREFS, channels: [] }).valid).toBe(false);
  });
  it("valid: no events, no channels", () => {
    expect(validatePrefs({ onDecision: false, onSettle: false, onHalt: false, channels: [] }).valid).toBe(true);
  });
});
