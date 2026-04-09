import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { ChangelogItemType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ListChangelogReleasesQuery } from "@/lib/changelog/changelog-dto";

type ChangelogItemRecord = {
  description: string | null;
  id: string;
  itemType: ChangelogItemType;
  sortOrder: number;
  title: string;
};

type ChangelogReleaseRecord = {
  createdAt: Date;
  id: string;
  isMajor: boolean;
  items: ChangelogItemRecord[];
  releasedOn: Date;
  sortOrder: number;
  summary: string | null;
  title: string;
  version: string;
};

type ChangelogItemInputData = {
  description?: string | null;
  itemType: ChangelogItemType;
  sortOrder: number;
  title: string;
};

type ChangelogReleaseCreateData = {
  isMajor: boolean;
  items: ChangelogItemInputData[];
  releasedOn: Date;
  sortOrder: number;
  summary?: string | null;
  title: string;
  version: string;
};

type ChangelogReleaseUpdateData = {
  isMajor?: boolean;
  items?: ChangelogItemInputData[];
  releasedOn?: Date;
  sortOrder?: number;
  summary?: string | null;
  title?: string;
  version?: string;
};

type FindManyOptions = ListChangelogReleasesQuery & {
  skip: number;
  take: number;
};

export type ChangelogReleaseRepository = {
  countByFilters: (filters: ListChangelogReleasesQuery) => Promise<number>;
  create: (data: ChangelogReleaseCreateData) => Promise<ChangelogReleaseRecord>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Promise<ChangelogReleaseRecord | null>;
  findByVersion: (version: string) => Promise<ChangelogReleaseRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<ChangelogReleaseRecord[]>;
  update: (id: string, data: ChangelogReleaseUpdateData) => Promise<ChangelogReleaseRecord>;
};

const changelogItemSelect = {
  description: true,
  id: true,
  itemType: true,
  sortOrder: true,
  title: true,
} satisfies Prisma.ChangelogItemSelect;

const changelogReleaseSelect = {
  createdAt: true,
  id: true,
  isMajor: true,
  items: {
    orderBy: {
      sortOrder: "asc",
    },
    select: changelogItemSelect,
  },
  releasedOn: true,
  sortOrder: true,
  summary: true,
  title: true,
  version: true,
} satisfies Prisma.ChangelogReleaseSelect;

function buildWhere(filters: Pick<ListChangelogReleasesQuery, "isMajor" | "keyword">): Prisma.ChangelogReleaseWhereInput {
  return {
    ...(filters.isMajor !== undefined ? { isMajor: filters.isMajor } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              title: {
                contains: filters.keyword,
              },
            },
            {
              version: {
                contains: filters.keyword,
              },
            },
            {
              summary: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

export function createChangelogReleaseRepository(database: PrismaClient = prisma): ChangelogReleaseRepository {
  return {
    async countByFilters(filters) {
      return database.changelogRelease.count({
        where: buildWhere(filters),
      });
    },
    async create(data) {
      const { items, ...releaseData } = data;

      return database.changelogRelease.create({
        data: {
          ...releaseData,
          ...(items.length > 0
            ? {
                items: {
                  create: items.map((item) => ({
                    ...item,
                  })),
                },
              }
            : {}),
        },
        select: changelogReleaseSelect,
      });
    },
    async delete(id) {
      await database.changelogRelease.delete({
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.changelogRelease.findUnique({
        select: changelogReleaseSelect,
        where: {
          id,
        },
      });
    },
    async findByVersion(version) {
      return database.changelogRelease.findUnique({
        select: changelogReleaseSelect,
        where: {
          version,
        },
      });
    },
    async findManyWithPagination({ isMajor, keyword, skip, take }) {
      return database.changelogRelease.findMany({
        orderBy: [
          {
            releasedOn: "desc",
          },
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: changelogReleaseSelect,
        skip,
        take,
        where: buildWhere({
          isMajor,
          keyword,
        }),
      });
    },
    async update(id, data) {
      const { items, ...releaseData } = data;

      return database.$transaction(async (transaction) => {
        await transaction.changelogRelease.update({
          data: releaseData,
          where: {
            id,
          },
        });

        if (items !== undefined) {
          await transaction.changelogItem.deleteMany({
            where: {
              releaseId: id,
            },
          });

          if (items.length > 0) {
            await transaction.changelogItem.createMany({
              data: items.map((item) => ({
                ...item,
                releaseId: id,
              })),
            });
          }
        }

        return transaction.changelogRelease.findUniqueOrThrow({
          select: changelogReleaseSelect,
          where: {
            id,
          },
        });
      });
    },
  };
}
