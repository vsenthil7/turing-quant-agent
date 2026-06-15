import React from "react";

export type AiMode = "driver" | "gate" | "advisor";
export interface ConfigPanelProps {
  aiMode: AiMode;
  dryRun: boolean;
  strategy: string;
  strategies: string[];
  onChangeMode: (mode: AiMode) => void;
  onToggleDryRun: (dryRun: boolean) => void;
  onChangeStrategy: (s: string) => void;
  editable: boolean;
}

const MODE_DESC: Record<AiMode, string> = {
  driver: "LLM produces the decision; rules sanity-check.",
  gate: "Rules propose; LLM vetoes or scales.",
  advisor: "Rules decide; LLM supplies rationale only."
};

export function ConfigPanel(p: ConfigPanelProps) {
  return (
    <section className="config" aria-label="Configuration">
      <h2>AI Policy</h2>
      <fieldset disabled={!p.editable}>
        <legend>Mode</legend>
        {(["driver", "gate", "advisor"] as AiMode[]).map(m => (
          <label key={m}>
            <input
              type="radio"
              name="aiMode"
              value={m}
              checked={p.aiMode === m}
              onChange={() => p.onChangeMode(m)}
            />
            {m}
          </label>
        ))}
        <p className="desc" data-testid="mode-desc">{MODE_DESC[p.aiMode]}</p>
      </fieldset>
      <label>
        Strategy
        <select value={p.strategy} onChange={e => p.onChangeStrategy(e.target.value)} disabled={!p.editable} aria-label="strategy">
          {p.strategies.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>
        <input type="checkbox" checked={p.dryRun} onChange={e => p.onToggleDryRun(e.target.checked)} disabled={!p.editable} />
        Dry-run
      </label>
    </section>
  );
}
