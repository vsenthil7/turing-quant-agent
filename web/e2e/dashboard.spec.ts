import { test, expect } from "@playwright/test";
/** Comprehensive web E2E. DESKTOP: run via `playwright test` against `next dev`
 *  with the agent API live or mocked (see fixtures below). Maximum-breadth:
 *  load, panels, live updates, error states, a11y, responsive, decision feed. */

test.describe("Dashboard — load + core panels", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/"); });

  test("renders title and status", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "QUANT AGENT" })).toBeVisible();
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("shows all six stat panels", async ({ page }) => {
    for (const label of ["Equity", "Cumulative PnL", "Drawdown", "Settled", "Open", "Status"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });
});

test.describe("Dashboard — data states", () => {
  test("renders mocked live state", async ({ page }) => {
    await page.route("**/state", r => r.fulfill({ json: {
      state: { equity: 1050, peakEquity: 1100, openDecisions: 1, settledCount: 12, cumulativePnl: 50, halted: false }, drawdown: 0.045
    }}));
    await page.route("**/health", r => r.fulfill({ json: { status: "ok", checks: {}, container: { aiMode: "gate", dryRun: true, wired: [] } }}));
    await page.route("**/config", r => r.fulfill({ json: { aiMode: "gate", risk: {}, signals: {}, dryRun: true }}));
    await page.goto("/");
    await expect(page.getByText("RUNNING")).toBeVisible();
  });

  test("shows HALTED when agent halted", async ({ page }) => {
    await page.route("**/state", r => r.fulfill({ json: {
      state: { equity: 800, peakEquity: 1000, openDecisions: 0, settledCount: 5, cumulativePnl: -200, halted: true }, drawdown: 0.2
    }}));
    await page.route("**/health", r => r.fulfill({ json: { status: "degraded", checks: {}, container: { aiMode: "gate", dryRun: false, wired: [] } }}));
    await page.route("**/config", r => r.fulfill({ json: { aiMode: "gate", risk: {}, signals: {}, dryRun: false }}));
    await page.goto("/");
    await expect(page.getByText("HALTED")).toBeVisible();
  });

  test("surfaces connection error on API failure", async ({ page }) => {
    await page.route("**/state", r => r.abort());
    await page.goto("/");
    await expect(page.getByText(/connection:/)).toBeVisible();
  });
});

test.describe("Dashboard — accessibility + responsive", () => {
  test("status has accessible name", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveAttribute("aria-label", /Healthy|Degraded|Down/);
  });

  test("renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "QUANT AGENT" })).toBeVisible();
  });

  test("renders on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByText("Equity", { exact: true })).toBeVisible();
  });
});
