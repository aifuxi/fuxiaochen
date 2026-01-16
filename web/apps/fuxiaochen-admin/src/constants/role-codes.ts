export const ROLE_CODES = {
  Admin: "admin",
  Visitor: "visitor",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const roleCodeOptions = Object.entries(ROLE_CODES).map(
  ([key, value]) => ({
    label: key,
    value,
  }),
);

export const roleCodeMap: Record<RoleCode, string> = {
  [ROLE_CODES.Admin]: "管理员",
  [ROLE_CODES.Visitor]: "访客",
};
