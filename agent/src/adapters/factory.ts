/** Adapter factory: selects MOCK (default, deterministic, offline) or LIVE
 *  (real external service) per adapter, driven by environment flags.
 *
 *  Resolution per adapter: explicit per-adapter env wins, else the global
 *  TQA_MODE, else "mock". Live selection requires the live config to be present;
 *  a request for live without config throws a clear, actionable error rather
 *  than silently degrading.
 *
 *    TQA_MODE=live              -> all adapters live (if configured)
 *    TQA_CHAIN_MODE=live        -> only chain live
 *    (unset)                    -> mock everywhere
 */
import type { Chain, LlmClient } from "../types.js";
import type { ProvenanceStore } from "../provenance.js";
import type { EventStore } from "../persistence.js";
import {
  createMockChain, createMockLlm, createMockProvenance, createMockEventStore, createMockOracle,
  type MockOracleConfig
} from "./mocks.js";
import { createViemChain, type ViemChainConfig } from "./viemChain.js";
import { createOpenAiLlm, type LlmConfig } from "./openaiLlm.js";
import { createIpfsProvenance, type IpfsConfig } from "./ipfsProvenance.js";
import { createSqliteEventStore, type SqliteConfig } from "./sqliteEventStore.js";
import { createMantleOracle, type MantleOracleConfig } from "./mantleOracle.js";

export type Mode = "mock" | "live";

export interface EnvLike { [k: string]: string | undefined; }

/** Resolve the mode for one adapter from env. Defaults to mock. */
export function resolveMode(env: EnvLike, key: string): Mode {
  const specific = env[key];
  const global = env.TQA_MODE;
  const v = (specific ?? global ?? "mock").toLowerCase();
  if (v !== "mock" && v !== "live") throw new Error(`invalid mode for ${key}: ${v} (expected mock|live)`);
  return v;
}

function requireConfig<T>(cfg: T | undefined, what: string): T {
  if (cfg === undefined) throw new Error(`LIVE ${what} selected but no config provided`);
  return cfg;
}

export interface AdapterConfigs {
  chain?: ViemChainConfig;
  llm?: LlmConfig;
  provenance?: IpfsConfig;
  eventStore?: SqliteConfig;
  oracle?: MantleOracleConfig;
  /** Deterministic quotes for the mock oracle (used in mock mode). */
  mockOracle?: MockOracleConfig;
}

export function makeChain(env: EnvLike, cfgs: AdapterConfigs = {}): Chain {
  return resolveMode(env, "TQA_CHAIN_MODE") === "live"
    ? createViemChain(requireConfig(cfgs.chain, "chain"))
    : createMockChain();
}

export function makeLlm(env: EnvLike, cfgs: AdapterConfigs = {}): LlmClient {
  return resolveMode(env, "TQA_LLM_MODE") === "live"
    ? createOpenAiLlm(requireConfig(cfgs.llm, "llm"))
    : createMockLlm();
}

export function makeProvenance(env: EnvLike, cfgs: AdapterConfigs = {}): ProvenanceStore {
  return resolveMode(env, "TQA_PROVENANCE_MODE") === "live"
    ? createIpfsProvenance(requireConfig(cfgs.provenance, "provenance"))
    : createMockProvenance();
}

export function makeEventStore(env: EnvLike, cfgs: AdapterConfigs = {}): EventStore {
  return resolveMode(env, "TQA_EVENTSTORE_MODE") === "live"
    ? createSqliteEventStore(requireConfig(cfgs.eventStore, "eventStore"))
    : createMockEventStore();
}

export function makeOracle(env: EnvLike, cfgs: AdapterConfigs = {}) {
  if (resolveMode(env, "TQA_ORACLE_MODE") === "live") {
    return createMantleOracle(requireConfig(cfgs.oracle, "oracle"));
  }
  return createMockOracle(requireConfig(cfgs.mockOracle, "mockOracle"));
}

/** Convenience: build the full adapter set in one call. */
export function makeAdapters(env: EnvLike, cfgs: AdapterConfigs = {}) {
  return {
    chain: makeChain(env, cfgs),
    llm: makeLlm(env, cfgs),
    provenance: makeProvenance(env, cfgs),
    eventStore: makeEventStore(env, cfgs),
    oracle: makeOracle(env, cfgs)
  };
}
