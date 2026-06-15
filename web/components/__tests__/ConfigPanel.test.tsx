import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ConfigPanel, type AiMode } from "../ConfigPanel";

function setup(overrides = {}) {
  const props = {
    aiMode: "gate" as AiMode, dryRun: true, strategy: "momentum",
    strategies: ["momentum", "breakout", "regime-adaptive"],
    onChangeMode: vi.fn(), onToggleDryRun: vi.fn(), onChangeStrategy: vi.fn(),
    editable: true, ...overrides
  };
  render(<ConfigPanel {...props} />);
  return props;
}

describe("ConfigPanel", () => {
  it("shows the active mode description", () => {
    setup({ aiMode: "driver" });
    expect(screen.getByTestId("mode-desc")).toHaveTextContent("LLM produces the decision");
  });
  it("selecting a mode fires callback", async () => {
    const p = setup();
    await userEvent.click(screen.getByLabelText("advisor"));
    expect(p.onChangeMode).toHaveBeenCalledWith("advisor");
  });
  it("changing strategy fires callback", async () => {
    const p = setup();
    await userEvent.selectOptions(screen.getByLabelText("strategy"), "breakout");
    expect(p.onChangeStrategy).toHaveBeenCalledWith("breakout");
  });
  it("toggling dry-run fires callback", async () => {
    const p = setup();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(p.onToggleDryRun).toHaveBeenCalledWith(false);
  });
  it("non-editable disables controls", () => {
    setup({ editable: false });
    expect(screen.getByLabelText("strategy")).toBeDisabled();
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
  it("reflects the three modes as radios", () => {
    setup();
    expect(screen.getByLabelText("driver")).toBeInTheDocument();
    expect(screen.getByLabelText("gate")).toBeInTheDocument();
    expect(screen.getByLabelText("advisor")).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(
      <ConfigPanel aiMode="gate" dryRun={false} strategy="momentum" strategies={["momentum"]}
        onChangeMode={() => {}} onToggleDryRun={() => {}} onChangeStrategy={() => {}} editable />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
