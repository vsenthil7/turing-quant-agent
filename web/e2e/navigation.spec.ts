import { test, expect } from "@playwright/test";
/** DESKTOP: navigation across the app shell. */
test.describe("Navigation", () => {
  test("moves between screens", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Leaderboard" }).click();
    await expect(page).toHaveURL(/leaderboard/);
    await page.getByRole("button", { name: "Config" }).click();
    await expect(page).toHaveURL(/config/);
  });
  test("active item marked current", async ({ page }) => {
    await page.goto("/config");
    await expect(page.getByRole("button", { name: "Config" })).toHaveAttribute("aria-current", "page");
  });
});
