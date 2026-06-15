/** Framework-free HTTP router over the pure api/api2 handlers. The router is a
 *  pure function (method,path,body) -> ApiResponse so it is fully unit-testable;
 *  the listening server (httpServer.ts) is the only side-effecting part. */
import type { Container } from "../container.js";
import {
  handleHealth, handleState, handleMetrics, handleConfig, handleReplay, type ApiResponse
} from "../api.js";

export interface RouteRequest {
  method: string;
  path: string;
  body?: unknown;
}

const notFound = (path: string): ApiResponse => ({ status: 404, body: { error: `no route: ${path}` } });
const methodNotAllowed = (method: string): ApiResponse => ({ status: 405, body: { error: `method not allowed: ${method}` } });

/** Resolve a request against the agent API surface. */
export async function route(c: Container, req: RouteRequest): Promise<ApiResponse> {
  const path = req.path.replace(/\/+$/, "") || "/";
  switch (path) {
    case "/health":
      return req.method === "GET" ? handleHealth(c) : methodNotAllowed(req.method);
    case "/state":
      return req.method === "GET" ? await handleState(c) : methodNotAllowed(req.method);
    case "/metrics":
      return req.method === "GET" ? handleMetrics(c) : methodNotAllowed(req.method);
    case "/config":
      return req.method === "GET" ? handleConfig(c) : methodNotAllowed(req.method);
    case "/replay":
      return req.method === "POST" ? handleReplay(c, req.body) : methodNotAllowed(req.method);
    default:
      return notFound(path);
  }
}
