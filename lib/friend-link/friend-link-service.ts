import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { friendLinkErrorCodes } from "@/lib/api/error-codes";
import type {
  CreateFriendLinkInput,
  ListFriendLinksQuery,
  UpdateFriendLinkInput,
} from "@/lib/friend-link/friend-link-dto";
import { toFriendLinkDto } from "@/lib/friend-link/friend-link-dto";
import type { FriendLinkRepository } from "@/lib/friend-link/friend-link-repository";

type ListFriendLinksResult = {
  items: ReturnType<typeof toFriendLinkDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FriendLinkService = {
  createFriendLink: (input: CreateFriendLinkInput) => Promise<ReturnType<typeof toFriendLinkDto>>;
  deleteFriendLink: (id: string) => Promise<{ id: string }>;
  getFriendLinkById: (id: string) => Promise<ReturnType<typeof toFriendLinkDto>>;
  listFriendLinks: (query: ListFriendLinksQuery) => Promise<ListFriendLinksResult>;
  updateFriendLink: (id: string, input: UpdateFriendLinkInput) => Promise<ReturnType<typeof toFriendLinkDto>>;
};

export function createFriendLinkService(repository: FriendLinkRepository): FriendLinkService {
  return {
    async createFriendLink(input) {
      await ensureSiteUrlAvailable(repository, input.siteUrl);
      await ensureAvatarAssetExists(repository, input.avatarAssetId);

      const friendLink = await createFriendLinkWithConflictHandling(repository, input);

      return toFriendLinkDto(friendLink);
    },
    async deleteFriendLink(id) {
      await getExistingFriendLink(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getFriendLinkById(id) {
      const friendLink = await getExistingFriendLink(repository, id);

      return toFriendLinkDto(friendLink);
    },
    async listFriendLinks(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findManyWithPagination({
          ...query,
          skip,
          take: query.pageSize,
        }),
        repository.countByFilters(query),
      ]);

      return {
        items: items.map(toFriendLinkDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateFriendLink(id, input) {
      const existingFriendLink = await getExistingFriendLink(repository, id);

      if (input.siteUrl && input.siteUrl !== existingFriendLink.siteUrl) {
        await ensureSiteUrlAvailable(repository, input.siteUrl, existingFriendLink.id);
      }

      if (input.avatarAssetId !== undefined) {
        await ensureAvatarAssetExists(repository, input.avatarAssetId);
      }

      const friendLink = await updateFriendLinkWithConflictHandling(repository, id, input);

      return toFriendLinkDto(friendLink);
    },
  };
}

async function ensureAvatarAssetExists(repository: FriendLinkRepository, avatarAssetId?: string | null) {
  if (!avatarAssetId) {
    return;
  }

  const avatarAsset = await repository.findAvatarAssetById(avatarAssetId);

  if (!avatarAsset) {
    throw new ApiError({
      code: friendLinkErrorCodes.FRIEND_LINK_AVATAR_ASSET_NOT_FOUND,
      message: "Avatar asset does not exist.",
    });
  }
}

async function ensureSiteUrlAvailable(repository: FriendLinkRepository, siteUrl: string, currentId?: string) {
  const existingFriendLink = await repository.findBySiteUrl(siteUrl);

  if (existingFriendLink && existingFriendLink.id !== currentId) {
    throw new ApiError({
      code: friendLinkErrorCodes.FRIEND_LINK_SITE_URL_CONFLICT,
      message: "Friend link site URL already exists.",
    });
  }
}

async function getExistingFriendLink(repository: FriendLinkRepository, id: string) {
  const friendLink = await repository.findById(id);

  if (!friendLink) {
    throw new ApiError({
      code: friendLinkErrorCodes.FRIEND_LINK_NOT_FOUND,
      message: "Friend link does not exist.",
    });
  }

  return friendLink;
}

async function createFriendLinkWithConflictHandling(repository: FriendLinkRepository, input: CreateFriendLinkInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeFriendLinkPersistenceError(error);
  }
}

async function updateFriendLinkWithConflictHandling(
  repository: FriendLinkRepository,
  id: string,
  input: UpdateFriendLinkInput,
) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeFriendLinkPersistenceError(error);
  }
}

function normalizeFriendLinkPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("siteUrl") || targets.includes("site_url")) {
      return new ApiError({
        code: friendLinkErrorCodes.FRIEND_LINK_SITE_URL_CONFLICT,
        message: "Friend link site URL already exists.",
      });
    }
  }

  return error;
}

function getErrorTargets(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;

  return Array.isArray(target) ? target.filter((item): item is string => typeof item === "string") : [];
}

function isPrismaUniqueConflictError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
