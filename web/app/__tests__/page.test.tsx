import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../page";

const stateOk = { state: { equity: 1050, peakEquity: 1100, openDecisions: 2, settledCount: 12, cumulativePnl: 50, halted: false }, drawdown: 0.045 };
const healthOk = { status: "ok", checks: {}, container: { aiMode: "gate", dryRun: true, wired: [] } };
const configOk = { aiMode: "gate", risk: {}, signals: {}, dryRun: true };

function mockFetch(impl: (url: string) => unknown, ok = true) {
  return vi.fn(async (url: string) => ({
    ok, status: ok ? 200 : 500, json: async () => impl(String(url))
  })) as unknown as typeof fetch;
}

beforeEach(() => { vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] }); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Dashboard page", () => {
  it("renders title immediately", () => {
    global.fetch = mockFetch(() => ({}));
    render(<Dashboard />);
    expect(screen.getByRole("heading", { name: "QUANT AGENT" })).toBeInTheDocument();
  });

  it("populates stats after successful poll", async () => {
    global.fetch = mockFetch((url) =>
      url.includes("/state") ? stateOk : url.includes("/health") ? healthOk : configOk);
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("RUNNING")).toBeInTheDocument());
    expect(screen.getByText("4.50%")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Healthy" })).toBeInTheDocument();
  });

  it("shows HALTED on halted state", async () => {
    const halted = { ...stateOk, state: { ...stateOk.state, halted: true } };
    global.fetch = mockFetch((url) =>
      url.includes("/state") ? halted : url.includes("/health") ? { ...healthOk, status: "degraded" } : configOk);
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("HALTED")).toBeInTheDocument());
  });

  it("surfaces an error alert when the API fails", async () => {
    global.fetch = vi.fn(async () => { throw new Error("network down"); }) as unknown as typeof fetch;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("network down"));
  });

  it("recovers: error then success clears the alert", async () => {
    let calls = 0;
    global.fetch = vi.fn(async (url: string) => {
      calls++;
      if (calls <= 3) throw new Error("temporary");
      return { ok: true, status: 200, json: async () =>
        String(url).includes("/state") ? stateOk : String(url).includes("/health") ? healthOk : configOk };
    }) as unknown as typeof fetch;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    await vi.advanceTimersByTimeAsync(5000); // next poll succeeds
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("renders placeholder dashes before first poll resolves", () => {
    global.fetch = mockFetch(() => new Promise(() => {})); // never resolves
    render(<Dashboard />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
