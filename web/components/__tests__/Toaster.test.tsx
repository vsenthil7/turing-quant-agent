import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Toaster } from "../Toaster";
import { makeToast } from "../../lib/toast";

describe("Toaster", () => {
  it("renders nothing when empty", () => {
    const { container } = render(<Toaster toasts={[]} onDismiss={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("renders success as status, error as alert", () => {
    render(<Toaster toasts={[makeToast("success", "ok", 0), makeToast("error", "bad", 0)]} onDismiss={() => {}} />);
    expect(screen.getByText("ok").closest("[role=status]")).toBeTruthy();
    expect(screen.getByText("bad").closest("[role=alert]")).toBeTruthy();
  });
  it("dismiss fires callback with id", async () => {
    const onDismiss = vi.fn();
    const t = makeToast("info", "hello", 0);
    render(<Toaster toasts={[t]} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByLabelText("Dismiss hello"));
    expect(onDismiss).toHaveBeenCalledWith(t.id);
  });
  it("has a notifications region", () => {
    render(<Toaster toasts={[makeToast("info", "x", 0)]} onDismiss={() => {}} />);
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<Toaster toasts={[makeToast("success", "x", 0)]} onDismiss={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
