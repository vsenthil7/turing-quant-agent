/** HTTP API surface as pure handler functions. A thin server adapter (Express/
 *  Fastify/Next route) calls these in Desktop; here they're framework-free and
 *  fully testable. Each handler: (Container, parsed body) -> response object. */
import type { Container } from "./container.js";
import { health } from "./observability.js";
import { rehydrate } from "./persistence.js";
import { currentDrawdown } from "./events.js";
import { replayStats, type ReplaySession } from "./replay.js";

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}

function ok<T>(body: T): ApiResponse<T> { return { status: 200, body }; }
function bad(message: string): ApiResponse<{ error: string }> { return { status: 400, body: { error: message } }; }

/** GET /health — liveness + dependency presence. */
export function handleHealth(c: Container): ApiResponse {
  const h = health({ llm: true, chain: true, store: true });
  return ok({ ...h, container: c.describe() });
}

/** GET /state — current reconstructed agent state + drawdown. */
export async function handleState(c: Container): Promise<ApiResponse> {
  const state = await rehydrate(c.eventStore);
  return ok({ state, drawdown: currentDrawdown(state) });
}

/** GET /metrics — counter/gauge snapshot. */
export function handleMetrics(c: Container): ApiResponse {
  return ok(c.metrics.snapshot());
}

/** POST /replay — deterministic stats for a recorded session. */
export function handleReplay(_c: Container, body: unknown): ApiResponse {
  if (typeof body !== "object" || body === null || !("frames" in body)) {
    return bad("invalid session");
  }
  try {
    const stats = replayStats(body as ReplaySession);
    return ok(stats);
  } catch (e) {
    return bad((e as Error).message);
  }
}

/** GET /config — current (non-secret) runtime config. */
export function handleConfig(c: Container): ApiResponse {
  return ok({ aiMode: c.config.aiMode, risk: c.config.risk, signals: c.config.signals, dryRun: c.config.dryRun });
}
