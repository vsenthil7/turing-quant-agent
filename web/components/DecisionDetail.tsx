import React from "react";
import { actionWord, statusLabel, explorerUrl, shortHash, type DecisionDetail } from "../lib/decisionDetail";

export interface DecisionDetailProps {
  detail: DecisionDetail;
  explorerBase: string;
}

export function DecisionDetailView({ detail, explorerBase }: DecisionDetailProps) {
  const status = statusLabel(detail);
  return (
    <article aria-label={`Decision ${detail.seq}`} className="decision-detail">
      <header>
        <h2>Decision #{detail.seq}</h2>
        <span className={`badge ${status}`} data-testid="status">{status}</span>
      </header>
      <dl>
        <dt>Action</dt><dd className={`a${detail.action}`}>{actionWord(detail.action)}</dd>
        <dt>Size</dt><dd>{detail.size}</dd>
        <dt>Signal</dt><dd title={detail.signalHash}>{shortHash(detail.signalHash)}</dd>
        <dt>Rationale</dt>
        <dd>{detail.rationale ?? <span className="pending" data-testid="rationale-pending">Resolving from provenance…</span>}</dd>
        {detail.settled && detail.pnl !== undefined && (
          <>
            <dt>PnL</dt>
            <dd className={detail.pnl >= 0 ? "pos" : "neg"} data-testid="pnl">{detail.pnl >= 0 ? "+" : ""}{detail.pnl}</dd>
          </>
        )}
      </dl>
      {detail.txHash && (
        <a className="tx-link" href={explorerUrl(explorerBase, detail.txHash)} target="_blank" rel="noopener noreferrer">
          View on explorer ({shortHash(detail.txHash)})
        </a>
      )}
    </article>
  );
}
