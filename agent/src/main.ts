/** Composition root + process entrypoint. DESKTOP: this file needs NO logic
 *  changes — it constructs adapters from env and starts the agent. Desktop only
 *  ensures env vars are set and the TODO[DESKTOP] calls inside adapters are filled. */
import { loadConfig } from "./loadConfig.js";
import { Container } from "./container.js";
import { createViemChain } from "./adapters/viemChain.js";
import { createIpfsProvenance } from "./adapters/ipfsProvenance.js";
import { createSqliteEventStore } from "./adapters/sqliteEventStore.js";
import { createOpenAiLlm } from "./adapters/openaiLlm.js";

class ConsoleSink { write(r: unknown) { console.log(JSON.stringify(r)); } }
class SilentSink { write(_r: unknown) { /* no-op: used for mock/test containers */ } }

import { makeAdapters, type EnvLike } from "./adapters/factory.js";

/** Build a Container from env using the adapter factory. Defaults to MOCK mode
 *  (no external services/keys); set TQA_MODE=live (+ live config) for real wiring.
 *  This is the import-safe, test-friendly composition root used by the server. */
export function buildContainerFromFactory(env: EnvLike = process.env as EnvLike): Container {
  const config = loadConfig(env);
  const mockOracle = {
    maxStalenessSec: 60, maxDivergenceBps: 100, minSources: 1,
    quotes: [{ source: "mock", price: 100 }]
  };
  const live = (env.TQA_MODE ?? "mock").toLowerCase() === "live";
  const adapters = makeAdapters(env, {
    mockOracle,
    ...(live ? {
      chain: { rpcUrl: env.MANTLE_RPC_URL!, decisionLogAddress: env.DECISION_LOG_ADDRESS as `0x${string}`, vaultAddress: env.VAULT_ADDRESS as `0x${string}`, privateKey: env.DEPLOYER_PRIVATE_KEY as `0x${string}` },
      llm: { apiUrl: env.LLM_API_URL!, apiKey: env.LLM_API_KEY!, model: env.LLM_MODEL ?? "gpt-4o-mini" },
      provenance: { apiUrl: env.IPFS_API_URL!, gatewayUrl: env.IPFS_GATEWAY_URL! },
      eventStore: { dbPath: env.DB_PATH ?? "./agent.db" }
    } : {})
  });
  return new Container({
    config,
    llm: adapters.llm,
    chain: adapters.chain,
    eventStore: adapters.eventStore,
    provenance: adapters.provenance,
    logSink: live ? new ConsoleSink() : new SilentSink()
  });
}

export function buildContainer(env: NodeJS.ProcessEnv = process.env): Container {
  const config = loadConfig(env);
  return new Container({
    config,
    llm: createOpenAiLlm({ apiUrl: env.LLM_API_URL!, apiKey: env.LLM_API_KEY!, model: env.LLM_MODEL ?? "gpt-4o-mini" }),
    chain: createViemChain({
      rpcUrl: env.MANTLE_RPC_URL!,
      decisionLogAddress: env.DECISION_LOG_ADDRESS as `0x${string}`,
      vaultAddress: env.VAULT_ADDRESS as `0x${string}`,
      privateKey: env.DEPLOYER_PRIVATE_KEY as `0x${string}`
    }),
    eventStore: createSqliteEventStore({ dbPath: env.DB_PATH ?? "./agent.db" }),
    provenance: createIpfsProvenance({ apiUrl: env.IPFS_API_URL!, gatewayUrl: env.IPFS_GATEWAY_URL! }),
    logSink: new ConsoleSink()
  });
}

// TODO[DESKTOP]: import { startServer } and run the trading loop; this guard keeps
// the module import-safe for tests.
if (process.env.RUN_AGENT === "1") {
  const c = buildContainer();
  c.logger.info("agent started", c.describe());
}
