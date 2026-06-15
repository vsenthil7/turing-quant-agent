import { test, expect } from "@playwright/test";
test.describe("Leaderboard", () => {
  test("renders ranked agents", async ({ page }) => {
    await page.route("**/leaderboard/public", r => r.fulfill({ json: [
      { rank: 1, agentId: "alpha", cumulativePnl: 800, sharpe: 2.1, hitRate: 0.65, reputation: 200, verified: true }
    ]}));
    await page.goto("/leaderboard");
    await expect(page.getByText("alpha")).toBeVisible();
  });
});
