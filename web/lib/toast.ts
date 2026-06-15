/** Pure toast/notification state logic. Reducer + helpers, framework-free. */
export type ToastKind = "success" | "error" | "info";
export interface Toast { id: string; kind: ToastKind; message: string; ttlMs: number; createdAt: number; }

export type ToastAction =
  | { type: "add"; toast: Toast }
  | { type: "dismiss"; id: string }
  | { type: "expire"; now: number };

export function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "add":
      return [...state, action.toast];
    case "dismiss":
      return state.filter(t => t.id !== action.id);
    case "expire":
      return state.filter(t => action.now - t.createdAt < t.ttlMs);
  }
}

let seq = 0;
export function makeToast(kind: ToastKind, message: string, now: number, ttlMs = 4000): Toast {
  return { id: `t${seq++}`, kind, message, ttlMs, createdAt: now };
}
