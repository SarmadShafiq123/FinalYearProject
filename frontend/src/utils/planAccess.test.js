import { describe, it, expect } from "vitest";
import { canAccessDashboard, getPostLoginRedirect } from "./planAccess";

describe("planAccess", () => {
  it("blocks dashboard access when the user has not completed their plan setup", () => {
    expect(canAccessDashboard({ planStatus: "inactive" })).toBe(false);
    expect(getPostLoginRedirect({ planStatus: "inactive" })).toBe("/pricing");
  });

  it("allows dashboard access for free and paid plans", () => {
    expect(canAccessDashboard({ planStatus: "free" })).toBe(true);
    expect(canAccessDashboard({ planStatus: "active" })).toBe(true);
    expect(getPostLoginRedirect({ planStatus: "free" })).toBe("/dashboard");
  });
});
