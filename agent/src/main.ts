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
