import React from "react";
export interface EmptyStateProps { message: string; }
export function EmptyState({ message }: EmptyStateProps) {
  return <div className="empty" role="note" aria-label="empty state">{message}</div>;
}
