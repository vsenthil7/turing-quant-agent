import { test, expect } from "@playwright/test";
/** DESKTOP: custody flows against running app + agent API. */
test.describe("Custody", () => {
  test("deposit flow updates balance", async ({ page }) => {
    await page.route("**/balance", r => r.fulfill({ json: { available: 100, locked: 0 } }));
    await page.goto("/custody");
    await page.getByLabel("amount").fill("50");
    await page.getByRole("button", { name: "Deposit" }).click();
    await expect(page.getByTestId("available")).toBeVisible();
  });
  test("withdraw blocked without permission", async ({ page }) => {
    await page.goto("/custody");
    await page.getByRole("tab", { name: "Withdraw" }).click();
    await page.getByLabel("amount").fill("10");
    await expect(page.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  });
});
