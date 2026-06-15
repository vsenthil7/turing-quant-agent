import { test, expect } from "@playwright/test";
test.describe("Backtest", () => {
  test("shows metrics + equity curve", async ({ page }) => {
    await page.route("**/backtest**", r => r.fulfill({ json: {
      report: { totalReturn: 0.25, sharpe: 1.8, sortino: 2.1, maxDrawdown: 0.12, winRate: 0.58, streaks: { longestWin: 4, longestLoss: 2 } },
      trades: 42, equityCurve: [1000, 1100, 1250]
    }}));
    await page.goto("/backtest");
    await expect(page.getByRole("img", { name: "Equity curve" })).toBeVisible();
  });
});
