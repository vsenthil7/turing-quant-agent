import React from "react";
import type { Toast } from "../lib/toast";

export interface ToasterProps { toasts: Toast[]; onDismiss: (id: string) => void; }

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toaster" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.kind}`} role={t.kind === "error" ? "alert" : "status"} data-testid={`toast-${t.id}`}>
          <span>{t.message}</span>
          <button aria-label={`Dismiss ${t.message}`} onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
