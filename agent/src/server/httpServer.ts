/** Node http server that adapts raw requests to the pure router. This is the
 *  only side-effecting module (network + process); the routing logic it calls
 *  is fully tested in router.test.ts. Started by the container in mock mode by
 *  default; TQA_MODE=live switches adapters via the factory. */
import http from "node:http";
import { buildContainerFromFactory } from "../main.js";
import { route } from "./router.js";

/** Read and JSON-parse a request body (empty body -> undefined). */
export function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (d: Buffer) => chunks.push(d));
    req.on("error", reject);
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (raw === "") return resolve(undefined);
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("invalid JSON body")); }
    });
  });
}

export function createServer(): http.Server {
  const container = buildContainerFromFactory();
  return http.createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      const json = JSON.stringify(body);
      res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(json) });
      res.end(json);
    };
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      let body: unknown;
      try { body = await readBody(req); }
      catch (e) { return send(400, { error: (e as Error).message }); }
      const resp = await route(container, { method: req.method ?? "GET", path: url.pathname, body });
      send(resp.status, resp.body);
    } catch (e) {
      send(500, { error: (e as Error).message });
    }
  });
}

if (process.env.RUN_SERVER === "1") {
  const port = Number(process.env.PORT ?? "8000");
  createServer().listen(port, () => console.log(JSON.stringify({ msg: "server listening", port })));
}
