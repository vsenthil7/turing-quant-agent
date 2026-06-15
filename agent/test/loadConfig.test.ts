import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/loadConfig.js";

describe("loadConfig", () => {
  it("uses defaults on empty env", () => {
    const c = loadConfig({});
    expect(c.aiMode).toBe("gate");
    expect(c.signals.fast).toBe(5);
    expect(c.dryRun).toBe(true);
  });
  it("reads overrides from env", () => {
    const c = loadConfig({ AI_MODE: "driver", SIGNAL_FAST: "3", SIGNAL_SLOW: "10", DRY_RUN: "false" });
    expect(c.aiMode).toBe("driver");
    expect(c.signals.fast).toBe(3);
    expect(c.dryRun).toBe(false);
  });
  it("rejects invalid env (fast >= slow)", () => {
    expect(() => loadConfig({ SIGNAL_FAST: "20", SIGNAL_SLOW: "10" })).toThrow();
  });
});
