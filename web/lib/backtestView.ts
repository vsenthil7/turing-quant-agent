/** Pure view-model for backtest results display. */
export interface PerfReport {
  totalReturn: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  winRate: number;
  streaks: { longestWin: number; longestLoss: number };
}

export interface BacktestResultView {
  report: PerfReport;
  trades: number;
  equityCurve: number[];
}

/** Grade a backtest into a qualitative band for display. */
export function gradeReport(r: PerfReport): "strong" | "moderate" | "weak" {
  if (r.sharpe >= 1.5 && r.maxDrawdown <= 0.2 && r.totalReturn > 0) return "strong";
  if (r.sharpe >= 0.5 && r.totalReturn > 0) return "moderate";
  return "weak";
}

/** Normalize an equity curve to 0..1 for sparkline rendering. */
export function normalizeCurve(curve: number[]): number[] {
  if (curve.length === 0) return [];
  const min = Math.min(...curve), max = Math.max(...curve);
  if (max === min) return curve.map(() => 0.5);
  return curve.map(v => (v - min) / (max - min));
}

/** Build SVG polyline points from a curve within a viewbox. */
export function sparklinePoints(curve: number[], width: number, height: number): string {
  const norm = normalizeCurve(curve);
  if (norm.length < 2) return "";
  return norm.map((v, i) => {
    const x = (i / (norm.length - 1)) * width;
    const y = height - v * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}
