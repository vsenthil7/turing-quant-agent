import type { Action } from "./types.js";

/** A recorded decision frame for deterministic replay (judge mode). */
export interface ReplayFrame {
  seq: number;
  signalHash: string;
  action: Action;
  size: number;
  rationale: string;
  pnl: number;
}

export interface ReplaySession {
  id: string;
  frames: ReplayFrame[];
}

/** Validate a session: sequential seq from 0, no gaps/dupes. */
export function validateSession(s: ReplaySession): void {
  if (s.id.length === 0) throw new Error("replay: empty id");
  for (let i = 0; i < s.frames.length; i++) {
    if (s.frames[i]!.seq !== i) {
      throw new Error(`replay: frame ${i} has seq ${s.frames[i]!.seq}`);
    }
  }
}

export interface ReplayStats {
  frames: number;
  trades: number;       // non-hold actions
  cumulativePnl: number;
  hitRate: number;      // settled wins / trades (0 if no trades)
}

/** Deterministically derive stats from a recorded session. Pure. */
export function replayStats(s: ReplaySession): ReplayStats {
  validateSession(s);
  let trades = 0;
  let wins = 0;
  let cumulativePnl = 0;
  for (const f of s.frames) {
    cumulativePnl += f.pnl;
    if (f.action !== 0) {
      trades++;
      if (f.pnl > 0) wins++;
    }
  }
  return {
    frames: s.frames.length,
    trades,
    cumulativePnl,
    hitRate: trades === 0 ? 0 : wins / trades
  };
}
