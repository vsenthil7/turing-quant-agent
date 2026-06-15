/** EventStore adapter — implements EventStore over SQLite (better-sqlite3).
 *  Serialization, snapshot/load semantics, and ordering are complete;
 *  DESKTOP fills only the actual SQL execution calls. */
import type { EventStore } from "../persistence.js";
import type { DomainEvent, AgentState } from "../events.js";

export interface SqliteConfig { dbPath: string; }

export function createSqliteEventStore(cfg: SqliteConfig): EventStore {
  void cfg;
  // TODO[DESKTOP]: const db = new Database(cfg.dbPath);
  //   db.exec("CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, payload TEXT)");
  //   db.exec("CREATE TABLE IF NOT EXISTS snapshots (seq INTEGER PRIMARY KEY, state TEXT)");
  return {
    async append(event: DomainEvent): Promise<void> {
      const payload = JSON.stringify(event);
      // TODO[DESKTOP]: db.prepare("INSERT INTO events (payload) VALUES (?)").run(payload)
      void payload;
      throw new Error("ADAPTER_NOT_WIRED: events.append");
    },
    async load(fromSeq: number): Promise<DomainEvent[]> {
      // TODO[DESKTOP]: rows = db.prepare("SELECT payload FROM events WHERE seq >= ? ORDER BY seq").all(fromSeq)
      //               return rows.map(r => JSON.parse(r.payload))
      void fromSeq;
      throw new Error("ADAPTER_NOT_WIRED: events.load");
    },
    async saveSnapshot(seq: number, state: AgentState): Promise<void> {
      const state_ = JSON.stringify(state);
      // TODO[DESKTOP]: db.prepare("INSERT OR REPLACE INTO snapshots (seq, state) VALUES (?, ?)").run(seq, state_)
      void seq; void state_;
      throw new Error("ADAPTER_NOT_WIRED: events.saveSnapshot");
    },
    async latestSnapshot(): Promise<{ seq: number; state: AgentState } | null> {
      // TODO[DESKTOP]: row = db.prepare("SELECT seq, state FROM snapshots ORDER BY seq DESC LIMIT 1").get()
      //               return row ? { seq: row.seq, state: JSON.parse(row.state) } : null
      throw new Error("ADAPTER_NOT_WIRED: events.latestSnapshot");
    }
  };
}
