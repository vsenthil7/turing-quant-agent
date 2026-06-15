/** Event-sourcing core: domain events + deterministic state reducer.
 *  The agent's entire state is reconstructable by folding the event log —
 *  the off-chain mirror of the on-chain DecisionLog. Pure. */

export type DomainEvent =
  | { type: "SessionStarted"; equity: number }
  | { type: "DecisionMade"; seq: number; action: -1 | 0 | 1; size: number }
  | { type: "TradeSettled"; seq: number; pnl: number }
  | { type: "Halted"; reason: string }
  | { type: "Resumed" };

export interface AgentState {
  equity: number;
  peakEquity: number;
  openDecisions: number;
  settledCount: number;
  cumulativePnl: number;
  halted: boolean;
}

export const initialState: AgentState = {
  equity: 0, peakEquity: 0, openDecisions: 0, settledCount: 0, cumulativePnl: 0, halted: false
};

/** Pure reducer: (state, event) -> state. Order-dependent, deterministic. */
export function reduce(state: AgentState, e: DomainEvent): AgentState {
  switch (e.type) {
    case "SessionStarted":
      return { ...state, equity: e.equity, peakEquity: e.equity };
    case "DecisionMade":
      return e.action === 0 ? state : { ...state, openDecisions: state.openDecisions + 1 };
    case "TradeSettled": {
      const equity = state.equity + e.pnl;
      return {
        ...state,
        equity,
        peakEquity: Math.max(state.peakEquity, equity),
        openDecisions: Math.max(0, state.openDecisions - 1),
        settledCount: state.settledCount + 1,
        cumulativePnl: state.cumulativePnl + e.pnl
      };
    }
    case "Halted":
      return { ...state, halted: true };
    case "Resumed":
      return { ...state, halted: false };
  }
}

/** Fold an entire event log into final state. */
export function replay(events: DomainEvent[]): AgentState {
  return events.reduce(reduce, initialState);
}

/** Current drawdown from reconstructed state (0 if no peak). */
export function currentDrawdown(state: AgentState): number {
  if (state.peakEquity <= 0) return 0;
  return Math.max(0, (state.peakEquity - state.equity) / state.peakEquity);
}
