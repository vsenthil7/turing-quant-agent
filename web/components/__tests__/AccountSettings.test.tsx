import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AccountSettings } from "../AccountSettings";
import { DEFAULT_PREFS } from "../../lib/notifyPrefs";
import type { AccountProfile } from "../../lib/account";

const owner: AccountProfile = { email: "o@x.c", role: "owner", tenantId: "t1", createdAt: 0 };
const viewer: AccountProfile = { email: "v@x.c", role: "viewer", tenantId: "t1", createdAt: 0 };

describe("AccountSettings", () => {
  it("shows profile details", () => {
    render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(screen.getByText("o@x.c")).toBeInTheDocument();
    expect(screen.getByTestId("role")).toHaveTextContent("owner");
  });
  it("lists role permissions", () => {
    render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    const list = screen.getByLabelText("permissions");
    expect(list).toHaveTextContent("withdraw");
    expect(list).toHaveTextContent("manage_users");
  });
  it("shows manage-users only for owner", () => {
    const { rerender } = render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(screen.getByTestId("manage-users")).toBeInTheDocument();
    rerender(<AccountSettings profile={viewer} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(screen.queryByTestId("manage-users")).not.toBeInTheDocument();
  });
  it("viewer sees only read permission", () => {
    render(<AccountSettings profile={viewer} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(screen.getByLabelText("permissions")).toHaveTextContent("read");
  });
  it("embeds notification prefs", () => {
    render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(screen.getByLabelText("Notification preferences")).toBeInTheDocument();
  });
  it("prefs change bubbles up", async () => {
    const onPrefsChange = vi.fn();
    render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={onPrefsChange} />);
    const { default: userEvent } = await import("@testing-library/user-event");
    await userEvent.click(screen.getByLabelText("On settle"));
    expect(onPrefsChange).toHaveBeenCalled();
  });
  it("no a11y violations", async () => {
    const { container } = render(<AccountSettings profile={owner} prefs={DEFAULT_PREFS} onPrefsChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
