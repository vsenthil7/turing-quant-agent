/** Deterministic in-memory MOCK adapters. Default runtime for tests and any
 *  environment without live external services. Each mock fully implements its
 *  interface so the whole agent runs offline. Live impls live alongside in the
 *  same folder and are selected via the factory (see factory.ts). */
import type { Chain, Action, LlmClient } from "../types.js";
import type { ProvenanceStore } from "../provenance.js";
import type { EventStore } from "../persistence.js";
import type { DomainEvent, AgentState } from "../events.js";
import { aggregatePrice, type PriceQuote, type OracleConfig, type OracleResult } from "../oracle.js";

/** Mock chain: records decisions in memory, hands back incrementing ids. */
export function createMockChain(): Chain & { readonly records: ReadonlyArray<{ id: number; signalHash: string; rationaleHash: string; action: Action }>; readonly executions: ReadonlyArray<{ decisionId: number; action: Action; size: number }> } {
  const records: { id: number; signalHash: string; rationaleHash: string; action: Action }[] = [];
  const executions: { decisionId: number; action: Action; size: number }[] = [];
  let nextId = 1;
  return {
    get records() { return records; },
    get executions() { return executions; },
    async record(signalHash: string, rationaleHash: string, action: Action): Promise<number> {
      const id = nextId++;
      records.push({ id, signalHash, rationaleHash, action });
      return id;
    },
    async execute(decisionId: number, action: Action, size: number): Promise<void> {
      executions.push({ decisionId, action, size });
    }
  };
}

/** Mock LLM: deterministic decision derived from a numeric hint in the prompt,
 *  else neutral hold. Always returns valid JSON matching the live contract. */
export function createMockLlm(): LlmClient {
  return {
    async decide(prompt: string): Promise<string> {
      const m = prompt.match(/score\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
      const score = m ? Number(m[1]) : 0;
      const action: Action = score > 0.1 ? 1 : score < -0.1 ? -1 : 0;
      return JSON.stringify({ action, size: action === 0 ? 0 : 1, rationale: "mock deterministic decision" });
    }
  };
}

/** Mock provenance: in-memory CID store keyed by a deterministic content hash. */
export function createMockProvenance(): ProvenanceStore {
  const store = new Map<string, string>();
  let n = 0;
  return {
    async put(content: string): Promise<string> {
      if (content.length === 0) throw new Error("provenance: empty content");
      const cid = `bafymock${(n++).toString(16).padStart(8, "0")}`;
      store.set(cid, content);
      return cid;
    },
    async get(cid: string): Promise<string> {
      const c = store.get(cid);
      if (c === undefined) throw new Error(`provenance: unknown cid ${cid}`);
      return c;
    }
  };
}

/** Mock event store: in-memory log + snapshot, same semantics as the SQLite one. */
export function createMockEventStore(): EventStore {
  const events: DomainEvent[] = [];
  let snapshot: { seq: number; state: AgentState } | null = null;
  return {
    async append(event: DomainEvent): Promise<void> { events.push(event); },
    async load(fromSeq: number): Promise<DomainEvent[]> { return events.slice(Math.max(0, fromSeq)); },
    async saveSnapshot(seq: number, state: AgentState): Promise<void> { snapshot = { seq, state }; },
    async latestSnapshot(): Promise<{ seq: number; state: AgentState } | null> { return snapshot; }
  };
}

export interface MockOracleConfig extends OracleConfig {
  /** Fixed quotes the mock returns (deterministic). */
  quotes: Omit<PriceQuote, "timestamp">[];
}

/** Mock oracle: returns fixed quotes through the real aggregation guard. */
export function createMockOracle(cfg: MockOracleConfig) {
  return {
    async getPrice(now: number = 0): Promise<OracleResult> {
      const quotes: PriceQuote[] = cfg.quotes.map(q => ({ ...q, timestamp: now }));
      return aggregatePrice(quotes, now, cfg);
    }
  };
}
