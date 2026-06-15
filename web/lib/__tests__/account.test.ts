import { describe, it, expect } from "vitest";
import { permissionsFor, canManageUsers, memberSince } from "../account";

describe("permissionsFor", () => {
  it("owner has all", () => expect(permissionsFor("owner")).toContain("withdraw"));
  it("viewer read-only", () => expect(permissionsFor("viewer")).toEqual(["read"]));
});
describe("canManageUsers", () => {
  it("owner yes, trader no", () => { expect(canManageUsers("owner")).toBe(true); expect(canManageUsers("trader")).toBe(false); });
});
describe("memberSince", () => {
  it("formats via injected formatter", () => {
    expect(memberSince(0, d => d.toISOString().slice(0, 10))).toBe("1970-01-01");
  });
});
