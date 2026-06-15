import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AgentManager } from "../AgentManager";
import type { AgentSummary } from "../../lib/agents";

const agents: AgentSummary[] = [
  { id: "1", name: "alpha", status: "running", strategy: "momentum", cumulativePnl: 100, verified: true },
  { id: "2", name: "beta", status: "paused", strategy: "breakout", cumulativePnl: -20, verified: false }
];

describe("AgentManager", () => {
  it("shows status counts", () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    expect(screen.getByTestId("counts")).toHaveTextContent("1 running · 1 paused");
  });
  it("lists agents", () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    expect(screen.getByTestId("agent-1")).toHaveTextContent("alpha");
    expect(screen.getByTestId("agent-2")).toHaveTextContent("beta");
  });
  it("filters by status", async () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText("status filter"), "running");
    expect(screen.getByTestId("agent-1")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-2")).not.toBeInTheDocument();
  });
  it("shows allowed actions per status", () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    const running = screen.getByTestId("agent-1");
    expect(within(running).getByRole("button", { name: "pause" })).toBeInTheDocument();
    expect(within(running).getByRole("button", { name: "stop" })).toBeInTheDocument();
    const paused = screen.getByTestId("agent-2");
    expect(within(paused).getByRole("button", { name: "resume" })).toBeInTheDocument();
  });
  it("fires onAction with id and action", async () => {
    const onAction = vi.fn();
    render(<AgentManager agents={agents} canControl onAction={onAction} />);
    await userEvent.click(within(screen.getByTestId("agent-1")).getByRole("button", { name: "pause" }));
    expect(onAction).toHaveBeenCalledWith("1", "pause");
  });
  it("hides controls when canControl false", () => {
    render(<AgentManager agents={agents} canControl={false} onAction={() => {}} />);
    expect(screen.queryByRole("button", { name: "pause" })).not.toBeInTheDocument();
  });
  it("empty state when filtered to none", async () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText("status filter"), "halted");
    expect(screen.getByText("No agents")).toBeInTheDocument();
  });
  it("marks verified vs unverified", () => {
    render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    expect(screen.getByLabelText("verified")).toBeInTheDocument();
    expect(screen.getByLabelText("unverified")).toBeInTheDocument();
  });
  it("no a11y violations", async () => {
    const { container } = render(<AgentManager agents={agents} canControl onAction={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
