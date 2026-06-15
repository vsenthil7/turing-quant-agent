import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiClient } from "../apiClient";

afterEach(() => vi.restoreAllMocks());

describe("ApiClient (mobile)", () => {
  it("hits the right paths and parses json", async () => {
    const calls: string[] = [];
    global.fetch = vi.fn(async (url: string) => {
      calls.push(String(url));
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    }) as unknown as typeof fetch;
    const c = new ApiClient("https://api.example.test");
    await c.health();
    await c.state();
    await c.metrics();
    await c.config();
    expect(calls).toEqual([
      "https://api.example.test/health",
      "https://api.example.test/state",
      "https://api.example.test/metrics",
      "https://api.example.test/config"
    ]);
  });

  it("throws with status detail on non-ok response", async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch;
    const c = new ApiClient("https://api.example.test");
    await expect(c.state()).rejects.toThrow("API /state -> 500");
  });
});
