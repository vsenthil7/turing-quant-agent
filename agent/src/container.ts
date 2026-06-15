/** Dependency-injection container. Wires the agent's injectable interfaces
 *  into one application context. Concrete impls (viem chain, OpenAI LLM,
 *  Mantle oracle, Postgres store) are constructed in Desktop and registered
 *  here. Pure: just composition + lifecycle, no I/O of its own. */
import type { LlmClient, Chain } from "./types.js";
import type { EventStore } from "./persistence.js";
import type { ProvenanceStore } from "./provenance.js";
import { Logger, Metrics, type Sink } from "./observability.js";
import type { Config } from "./config.js";

export interface Dependencies {
  config: Config;
  llm: LlmClient;
  chain: Chain;
  eventStore: EventStore;
  provenance: ProvenanceStore;
  logSink: Sink;
}

export class Container {
  readonly config: Config;
  readonly llm: LlmClient;
  readonly chain: Chain;
  readonly eventStore: EventStore;
  readonly provenance: ProvenanceStore;
  readonly logger: Logger;
  readonly metrics: Metrics;

  constructor(deps: Dependencies, clock: () => number = Date.now) {
    this.config = deps.config;
    this.llm = deps.llm;
    this.chain = deps.chain;
    this.eventStore = deps.eventStore;
    this.provenance = deps.provenance;
    this.logger = new Logger(deps.logSink, clock);
    this.metrics = new Metrics();
  }

  /** Health snapshot of wired dependencies (presence checks). */
  describe(): { aiMode: string; dryRun: boolean; wired: string[] } {
    return {
      aiMode: this.config.aiMode,
      dryRun: this.config.dryRun,
      wired: ["llm", "chain", "eventStore", "provenance", "logger", "metrics"]
    };
  }
}
