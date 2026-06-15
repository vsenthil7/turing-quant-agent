import React from "react";
import { EmptyState } from "./EmptyState";

export type AsyncStatus = "loading" | "error" | "ready";
export interface AsyncBoundaryProps {
  status: AsyncStatus;
  error?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

export function AsyncBoundary({ status, error, isEmpty, emptyMessage = "Nothing here yet", children, onRetry }: AsyncBoundaryProps) {
  if (status === "loading") {
    return <div className="loading" role="status" aria-live="polite" aria-busy="true">Loading…</div>;
  }
  if (status === "error") {
    return (
      <div className="error-state" role="alert">
        <span>{error ?? "Something went wrong"}</span>
        {onRetry && <button onClick={onRetry}>Retry</button>}
      </div>
    );
  }
  if (isEmpty) return <EmptyState message={emptyMessage} />;
  return <>{children}</>;
}
