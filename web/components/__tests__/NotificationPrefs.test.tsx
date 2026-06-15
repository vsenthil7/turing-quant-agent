import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NotificationPrefsPanel } from "../NotificationPrefs";
import { DEFAULT_PREFS } from "../../lib/notifyPrefs";

describe("NotificationPrefsPanel", () => {
  it("reflects current prefs", () => {
    render(<NotificationPrefsPanel prefs={DEFAULT_PREFS} onChange={() => {}} />);
    expect(screen.getByLabelText("On decision")).toBeChecked();
    expect(screen.getByLabelText("push")).toBeChecked();
    expect(screen.getByLabelText("email")).not.toBeChecked();
  });
  it("toggling an event fires onChange", async () => {
    const onChange = vi.fn();
    render(<NotificationPrefsPanel prefs={DEFAULT_PREFS} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("On settle"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ onSettle: false }));
  });
  it("toggling a channel fires onChange", async () => {
    const onChange = vi.fn();
    render(<NotificationPrefsPanel prefs={DEFAULT_PREFS} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("email"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ channels: expect.arrayContaining(["email"]) }));
  });
  it("shows validation error when events on but no channels", () => {
    render(<NotificationPrefsPanel prefs={{ ...DEFAULT_PREFS, channels: [] }} onChange={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("at least one channel");
  });
  it("no error when valid", () => {
    render(<NotificationPrefsPanel prefs={DEFAULT_PREFS} onChange={() => {}} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<NotificationPrefsPanel prefs={DEFAULT_PREFS} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
