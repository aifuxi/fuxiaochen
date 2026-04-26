import type { Changelog, ChangelogType } from "@/lib/db/schema";
import { formatIsoDateOnly } from "@/lib/server/content-utils";

type ChangelogReadModel = Changelog;

export type PublicChangelog = {
  id: string;
  version: string;
  title: string;
  date: string;
  type: ChangelogType;
  description: string;
  changes: string[];
};

export type AdminChangelog = {
  id: string;
  version: string;
  title: string;
  releaseDate: string;
  type: ChangelogType;
  description: string;
  changes: string[];
  createdAt: string;
  updatedAt: string;
};

export function toPublicChangelog(
  changelog: ChangelogReadModel,
): PublicChangelog {
  return {
    id: changelog.id,
    version: changelog.version,
    title: changelog.title,
    date: formatIsoDateOnly(changelog.releaseDate),
    type: changelog.type,
    description: changelog.description,
    changes: changelog.changes,
  };
}

export function toAdminChangelog(
  changelog: ChangelogReadModel,
): AdminChangelog {
  return {
    id: changelog.id,
    version: changelog.version,
    title: changelog.title,
    releaseDate: changelog.releaseDate.toISOString(),
    type: changelog.type,
    description: changelog.description,
    changes: changelog.changes,
    createdAt: changelog.createdAt.toISOString(),
    updatedAt: changelog.updatedAt.toISOString(),
  };
}
