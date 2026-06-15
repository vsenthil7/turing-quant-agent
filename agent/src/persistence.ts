/** Event store persistence + snapshotting. Backend (Postgres/SQLite/file) is
 *  injectable; here we define the interface and a snapshot policy that bounds
 *  replay cost. Pure logic over an injected store. */
import { reduce, replay, initialState, type DomainEvent, type AgentState } from "./events.js";

export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  load(fromSeq: number): Promise<DomainEvent[]>;
  saveSnapshot(seq: number, state: AgentState): Promise<void>;
  latestSnapshot(): Promise<{ seq: number; state: AgentState } | null>;
}

/** Rehydrate state: load latest snapshot, then fold events since. */
export async function rehydrate(store: EventStore): Promise<AgentState> {
  const snap = await store.latestSnapshot();
  if (snap === null) {
    const all = await store.load(0);
    return replay(all);
  }
  const since = await store.load(snap.seq + 1);
  return since.reduce(reduce, snap.state);
}

/** Decide whether to snapshot, given event count since last snapshot. */
export function shouldSnapshot(eventsSinceSnapshot: number, interval: number): boolean {
  if (interval <= 0) throw new RangeError("interval must be > 0");
  return eventsSinceSnapshot >= interval;
}

/** Append an event and snapshot if policy says so. Returns new state. */
export async function appendAndMaybeSnapshot(
  store: EventStore,
  current: AgentState,
  event: DomainEvent,
  seq: number,
  eventsSinceSnapshot: number,
  interval: number
): Promise<{ state: AgentState; snapshotted: boolean }> {
  await store.append(event);
  const state = reduce(current, event);
  if (shouldSnapshot(eventsSinceSnapshot + 1, interval)) {
    await store.saveSnapshot(seq, state);
    return { state, snapshotted: true };
  }
  return { state, snapshotted: false };
}

export { initialState };
