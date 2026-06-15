import React from "react";
import { gradeReport, sparklinePoints, type BacktestResultView } from "../lib/backtestView";

export interface BacktestResultsProps { result: BacktestResultView; }

export function BacktestResults({ result }: BacktestResultsProps) {
  const { report, trades, equityCurve } = result;
  const grade = gradeReport(report);
  const pts = sparklinePoints(equityCurve, 300, 80);
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  return (
    <section aria-label="Backtest results" className="backtest">
      <header>
        <h2>Backtest</h2>
        <span className={`grade ${grade}`} data-testid="grade">{grade}</span>
      </header>
      <dl className="metrics">
        <dt>Total return</dt><dd className={report.totalReturn >= 0 ? "pos" : "neg"} data-testid="total-return">{pct(report.totalReturn)}</dd>
        <dt>Sharpe</dt><dd data-testid="sharpe">{report.sharpe.toFixed(2)}</dd>
        <dt>Sortino</dt><dd>{report.sortino.toFixed(2)}</dd>
        <dt>Max drawdown</dt><dd className="neg" data-testid="max-dd">{pct(report.maxDrawdown)}</dd>
        <dt>Win rate</dt><dd>{pct(report.winRate)}</dd>
        <dt>Trades</dt><dd>{trades}</dd>
        <dt>Best streak</dt><dd>{report.streaks.longestWin}</dd>
        <dt>Worst streak</dt><dd>{report.streaks.longestLoss}</dd>
      </dl>
      {pts ? (
        <svg className="equity-curve" viewBox="0 0 300 80" role="img" aria-label="Equity curve" data-testid="equity-svg">
          <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        <p className="no-curve" data-testid="no-curve">Not enough data for a chart</p>
      )}
    </section>
  );
}
