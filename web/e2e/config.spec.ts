import { test, expect } from "@playwright/test";
test.describe("Config", () => {
  test("switching AI mode updates description", async ({ page }) => {
    await page.goto("/config");
    await page.getByLabel("driver").check();
    await expect(page.getByTestId("mode-desc")).toContainText("LLM produces");
  });
});
