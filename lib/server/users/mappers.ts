import type { UserRole } from "@/lib/db/schema";

import type { AdminUserRecord, AdminUserStats } from "./repository";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: boolean;
  linkedProviders: string[];
  sessionCount: number;
  lastSessionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserDetail = AdminUserListItem;

export type AdminUserSummaryStats = AdminUserStats;

const toIsoStringOrNull = (value: Date | string | null) => {
  if (!value) {
    return null;
  }

  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
};

const normalizeLinkedProviders = (linkedProviders: string[]) =>
  [...linkedProviders].sort((left, right) => left.localeCompare(right));

export function toAdminUserListItem(user: AdminUserRecord): AdminUserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    linkedProviders: normalizeLinkedProviders(user.linkedProviders),
    sessionCount: user.sessionCount,
    lastSessionAt: toIsoStringOrNull(user.lastSessionAt),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toAdminUserDetail(user: AdminUserRecord): AdminUserDetail {
  return toAdminUserListItem(user);
}
