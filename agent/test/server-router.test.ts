/** Sprint 6: server router + mock container tests. Exercises every route, every
 *  method-guard, 404, and the mock-mode composition root end-to-end. */
import { describe, it, expect } from "vitest";
import { route } from "../src/server/router.js";
import { buildContainerFromFactory } from "../src/main.js";
import type { Container } from "../src/container.js";

function mockContainer(): Container {
  return buildContainerFromFactory({}); // no env -> mock mode
}

describe("buildContainerFromFactory (mock mode)", () => {
  it("builds a container with mock adapters and no env", () => {
    const c = mockContainer();
    expect(c.describe().wired).toContain("chain");
    expect(c.config.aiMode).toBe("gate");
  });
});

describe("router", () => {
  it("GET /health returns 200 with container describe", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/health" });
    expect(r.status).toBe(200);
    expect((r.body as any).container.wired).toContain("llm");
  });
  it("GET /state returns reconstructed state + drawdown", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/state" });
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("state");
    expect(r.body).toHaveProperty("drawdown");
  });
  it("GET /metrics returns counters/gauges", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/metrics" });
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("counters");
  });
  it("GET /config returns non-secret config", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/config" });
    expect(r.status).toBe(200);
    expect((r.body as any).aiMode).toBe("gate");
  });
  it("POST /replay validates body", async () => {
    const bad = await route(mockContainer(), { method: "POST", path: "/replay", body: {} });
    expect(bad.status).toBe(400);
    const okFrames = await route(mockContainer(), { method: "POST", path: "/replay", body: { frames: [] } });
    expect([200, 400]).toContain(okFrames.status); // valid shape -> handler decides
  });
  it("trailing slash is normalised", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/health/" });
    expect(r.status).toBe(200);
  });
  it("unknown path -> 404", async () => {
    const r = await route(mockContainer(), { method: "GET", path: "/nope" });
    expect(r.status).toBe(404);
  });
  it("root / and all-slashes normalise to '/' (404, not a crash)", async () => {
    expect((await route(mockContainer(), { method: "GET", path: "/" })).status).toBe(404);
    expect((await route(mockContainer(), { method: "GET", path: "///" })).status).toBe(404);
  });
  it("wrong method -> 405", async () => {
    expect((await route(mockContainer(), { method: "POST", path: "/health" })).status).toBe(405);
    expect((await route(mockContainer(), { method: "GET", path: "/replay" })).status).toBe(405);
    expect((await route(mockContainer(), { method: "DELETE", path: "/state" })).status).toBe(405);
    expect((await route(mockContainer(), { method: "PUT", path: "/metrics" })).status).toBe(405);
    expect((await route(mockContainer(), { method: "PATCH", path: "/config" })).status).toBe(405);
  });
});
