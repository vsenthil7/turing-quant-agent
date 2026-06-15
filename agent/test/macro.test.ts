import { describe, it, expect, vi } from "vitest";
import { parseMacroView, assessMacro, conditionByRegime, type MacroView } from "../src/macro.js";

describe("parseMacroView — happy", () => {
  it("parses a valid view", () => {
    const v = parseMacroView('{"regime":"risk-on","confidence":0.8,"rationale":"strong"}');
    expect(v).toEqual({ regime: "risk-on", confidence: 0.8, rationale: "strong" });
  });
});

describe("parseMacroView — negative", () => {
  it("throws on invalid JSON", () => {
    expect(() => parseMacroView("x")).toThrow("invalid JSON");
  });
  it("throws on non-object", () => {
    expect(() => parseMacroView("7")).toThrow("not an object");
  });
  it("throws on null", () => {
    expect(() => parseMacroView("null")).toThrow("not an object");
  });
  it("throws on bad regime", () => {
    expect(() => parseMacroView('{"regime":"boom","confidence":0.5,"rationale":"x"}')).toThrow("bad regime");
  });
  it("throws on bad confidence (range)", () => {
    expect(() => parseMacroView('{"regime":"neutral","confidence":2,"rationale":"x"}')).toThrow("bad confidence");
  });
  it("throws on bad confidence (type)", () => {
    expect(() => parseMacroView('{"regime":"neutral","confidence":"hi","rationale":"x"}')).toThrow("bad confidence");
  });
  it("throws on empty rationale", () => {
    expect(() => parseMacroView('{"regime":"neutral","confidence":0.5,"rationale":""}')).toThrow("bad rationale");
  });
});

describe("assessMacro", () => {
  it("delegates to llm + parses", async () => {
    const llm = { decide: vi.fn(async () => '{"regime":"risk-off","confidence":0.9,"rationale":"fear"}') };
    const v = await assessMacro(llm, "ctx");
    expect(v.regime).toBe("risk-off");
    expect(llm.decide).toHaveBeenCalledWith("ctx");
  });
});

describe("conditionByRegime", () => {
  const off: MacroView = { regime: "risk-off", confidence: 0.9, rationale: "x" };
  const on: MacroView = { regime: "risk-on", confidence: 0.9, rationale: "x" };
  const neutral: MacroView = { regime: "neutral", confidence: 0.9, rationale: "x" };
  const weakOff: MacroView = { regime: "risk-off", confidence: 0.3, rationale: "x" };

  it("risk-off suppresses long", () => expect(conditionByRegime(1, off, 0.5)).toBe(0));
  it("risk-off passes short", () => expect(conditionByRegime(-1, off, 0.5)).toBe(-1));
  it("risk-on suppresses short", () => expect(conditionByRegime(-1, on, 0.5)).toBe(0));
  it("risk-on passes long", () => expect(conditionByRegime(1, on, 0.5)).toBe(1));
  it("neutral passes through", () => expect(conditionByRegime(1, neutral, 0.5)).toBe(1));
  it("weak confidence passes through (no override)", () => expect(conditionByRegime(1, weakOff, 0.5)).toBe(1));
  it("hold stays hold", () => expect(conditionByRegime(0, off, 0.5)).toBe(0));
});
