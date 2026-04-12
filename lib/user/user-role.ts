export const userRoleValues = ["Admin", "Normal"] as const;

export type UserRole = (typeof userRoleValues)[number];

export const userRoleOptions = [
  {
    label: "管理员",
    value: "Admin",
  },
  {
    label: "普通用户",
    value: "Normal",
  },
] as const satisfies Array<{
  label: string;
  value: UserRole;
}>;

export function isAdminRole(role: unknown): role is Extract<UserRole, "Admin"> {
  return role === "Admin" || role === "admin";
}

export function getRegistrationRole(hasAdminUser: boolean): UserRole {
  return hasAdminUser ? "Normal" : "Admin";
}
