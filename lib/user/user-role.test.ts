import { describe, expect, test } from "vitest";

import { getRegistrationRole, isAdminRole } from "@/lib/user/user-role";

describe("user role helpers", () => {
  test("assigns admin role when there is no existing admin user", () => {
    expect(getRegistrationRole(false)).toBe("Admin");
  });

  test("assigns normal role when an admin user already exists", () => {
    expect(getRegistrationRole(true)).toBe("Normal");
  });

  test("treats lowercase and enum admin values as admin", () => {
    expect(isAdminRole("Admin")).toBe(true);
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("Normal")).toBe(false);
  });
});
