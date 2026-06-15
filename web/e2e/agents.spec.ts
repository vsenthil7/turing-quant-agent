import { test, expect } from "@playwright/test";
test.describe("Agent management", () => {
  test("lists and filters agents", async ({ page }) => {
    await page.route("**/agents**", r => r.fulfill({ json: [
      { id: "1", name: "alpha", status: "running", strategy: "momentum", cumulativePnl: 100, verified: true }
    ]}));
    await page.goto("/agents");
    await expect(page.getByText("alpha")).toBeVisible();
  });
});
