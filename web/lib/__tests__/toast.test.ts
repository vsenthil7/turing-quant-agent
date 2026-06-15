import { describe, it, expect } from "vitest";
import { toastReducer, makeToast } from "../toast";

describe("toastReducer", () => {
  const t = makeToast("success", "saved", 1000, 4000);
  it("adds a toast", () => expect(toastReducer([], { type: "add", toast: t })).toHaveLength(1));
  it("dismisses by id", () => {
    expect(toastReducer([t], { type: "dismiss", id: t.id })).toHaveLength(0);
  });
  it("dismiss ignores unknown id", () => {
    expect(toastReducer([t], { type: "dismiss", id: "nope" })).toHaveLength(1);
  });
  it("expires past-ttl toasts", () => {
    expect(toastReducer([t], { type: "expire", now: 1000 + 4001 })).toHaveLength(0);
  });
  it("keeps toasts within ttl", () => {
    expect(toastReducer([t], { type: "expire", now: 1000 + 100 })).toHaveLength(1);
  });
  it("makeToast produces unique ids", () => {
    expect(makeToast("info", "a", 0).id).not.toBe(makeToast("info", "b", 0).id);
  });
});
