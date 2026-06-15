import { describe, it, expect } from "vitest";
import { parseDecision } from "../src/parse.js";

describe("parseDecision — happy", () => {
  it("parses a valid long decision", () => {
    const d = parseDecision('{"action":1,"size":10,"rationale":"trend up"}');
    expect(d).toEqual({ action: 1, size: 10, rationale: "trend up" });
  });
  it("parses a hold", () => {
    expect(parseDecision('{"action":0,"size":0,"rationale":"flat"}').action).toBe(0);
  });
});

describe("parseDecision — negative", () => {
  it("throws on invalid JSON", () => {
    expect(() => parseDecision("not json")).toThrow("invalid JSON");
  });
  it("throws on non-object", () => {
    expect(() => parseDecision("42")).toThrow("not an object");
  });
  it("throws on null", () => {
    expect(() => parseDecision("null")).toThrow("not an object");
  });
  it("throws on bad action", () => {
    expect(() => parseDecision('{"action":5,"size":1,"rationale":"x"}')).toThrow("bad action");
  });
  it("throws on bad size (negative)", () => {
    expect(() => parseDecision('{"action":1,"size":-1,"rationale":"x"}')).toThrow("bad size");
  });
  it("throws on bad size (non-number)", () => {
    expect(() => parseDecision('{"action":1,"size":"big","rationale":"x"}')).toThrow("bad size");
  });
  it("throws on empty rationale", () => {
    expect(() => parseDecision('{"action":1,"size":1,"rationale":""}')).toThrow("bad rationale");
  });
  it("throws on missing rationale", () => {
    expect(() => parseDecision('{"action":1,"size":1}')).toThrow("bad rationale");
  });
});
