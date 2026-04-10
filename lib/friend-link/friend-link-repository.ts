import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { FriendLinkStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ListFriendLinksQuery } from "@/lib/friend-link/friend-link-dto";

type FriendLinkAvatarAssetRecord = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

type FriendLinkRecord = {
  avatarAsset: FriendLinkAvatarAssetRecord | null;
  avatarAssetId: string | null;
  createdAt: Date;
  description: string;
  domain: string | null;
  id: string;
  siteName: string;
  siteUrl: string;
  sortOrder: number;
  status: FriendLinkStatus;
  subtitle: string | null;
  updatedAt: Date;
};

type FriendLinkCreateData = {
  avatarAssetId?: string | null;
  description: string;
  domain?: string | null;
  siteName: string;
  siteUrl: string;
  sortOrder: number;
  status: FriendLinkStatus;
  subtitle?: string | null;
};

type FriendLinkUpdateData = {
  avatarAssetId?: string | null;
  description?: string;
  domain?: string | null;
  siteName?: string;
  siteUrl?: string;
  sortOrder?: number;
  status?: FriendLinkStatus;
  subtitle?: string | null;
};

type FindManyOptions = ListFriendLinksQuery & {
  skip: number;
  take: number;
};

export type FriendLinkRepository = {
  countByFilters: (filters: ListFriendLinksQuery) => Promise<number>;
  create: (data: FriendLinkCreateData) => Promise<FriendLinkRecord>;
  delete: (id: string) => Promise<void>;
  findAvatarAssetById: (id: string) => Promise<{ id: string } | null>;
  findById: (id: string) => Promise<FriendLinkRecord | null>;
  findBySiteUrl: (siteUrl: string) => Promise<FriendLinkRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<FriendLinkRecord[]>;
  update: (id: string, data: FriendLinkUpdateData) => Promise<FriendLinkRecord>;
};

const avatarAssetSelect = {
  altText: true,
  id: true,
  originalUrl: true,
} satisfies Prisma.MediaAssetSelect;

const friendLinkSelect = {
  avatarAsset: {
    select: avatarAssetSelect,
  },
  avatarAssetId: true,
  createdAt: true,
  description: true,
  domain: true,
  id: true,
  siteName: true,
  siteUrl: true,
  sortOrder: true,
  status: true,
  subtitle: true,
  updatedAt: true,
} satisfies Prisma.FriendLinkSelect;

function buildFriendLinkWhere(filters: Pick<ListFriendLinksQuery, "keyword" | "status">): Prisma.FriendLinkWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              siteName: {
                contains: filters.keyword,
              },
            },
            {
              siteUrl: {
                contains: filters.keyword,
              },
            },
            {
              subtitle: {
                contains: filters.keyword,
              },
            },
            {
              description: {
                contains: filters.keyword,
              },
            },
            {
              domain: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

export function createFriendLinkRepository(database: PrismaClient = prisma): FriendLinkRepository {
  return {
    async countByFilters(filters) {
      return database.friendLink.count({
        where: buildFriendLinkWhere(filters),
      });
    },
    async create(data) {
      return database.friendLink.create({
        data,
        select: friendLinkSelect,
      });
    },
    async delete(id) {
      await database.friendLink.delete({
        where: {
          id,
        },
      });
    },
    async findAvatarAssetById(id) {
      return database.mediaAsset.findUnique({
        select: {
          id: true,
        },
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.friendLink.findUnique({
        select: friendLinkSelect,
        where: {
          id,
        },
      });
    },
    async findBySiteUrl(siteUrl) {
      return database.friendLink.findUnique({
        select: friendLinkSelect,
        where: {
          siteUrl,
        },
      });
    },
    async findManyWithPagination({ keyword, skip, status, take }) {
      return database.friendLink.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            updatedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: friendLinkSelect,
        skip,
        take,
        where: buildFriendLinkWhere({
          keyword,
          status,
        }),
      });
    },
    async update(id, data) {
      return database.friendLink.update({
        data,
        select: friendLinkSelect,
        where: {
          id,
        },
      });
    },
  };
}
