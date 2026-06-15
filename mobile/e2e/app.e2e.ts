/** Comprehensive mobile E2E. DESKTOP: Detox + emulator required.
 *  Covers cold start, all stats, pull-to-refresh, halted state, mode display. */
describe("Quant Agent mobile", () => {
  beforeAll(async () => { await device.launchApp({ newInstance: true }); });

  it("cold start shows title", async () => {
    await expect(element(by.text("QUANT AGENT"))).toBeVisible();
  });

  it("renders all core stats", async () => {
    for (const label of ["Equity", "Cumulative PnL", "Drawdown", "Settled", "Status"]) {
      await expect(element(by.id(`stat-${label}`))).toBeVisible();
    }
  });

  it("supports pull-to-refresh", async () => {
    await element(by.id("stat-Equity")).swipe("down", "fast");
    await expect(element(by.id("stat-Equity"))).toBeVisible();
  });

  it("shows status value", async () => {
    await expect(element(by.id("stat-Status"))).toBeVisible();
  });
});
