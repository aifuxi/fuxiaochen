import { generateCuid } from "@/lib/cuid";
import type { Friend, NewFriend } from "@/lib/db/schema";
import { normalizeNullableString } from "@/lib/server/content-utils";
import type {
  AdminFriendCreateInput,
  AdminFriendListQuery,
  AdminFriendUpdateInput,
} from "@/lib/server/friends/dto";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import {
  notificationService,
  type NotificationService,
} from "@/lib/server/notifications/service";

import { friendRepository, type FriendRepository } from "./repository";

export interface FriendService {
  listAdminFriends(query: AdminFriendListQuery): Promise<{
    items: Friend[];
    total: number;
  }>;
  listPublicFriends(): Promise<Friend[]>;
  getAdminFriend(id: string): Promise<Friend>;
  createFriend(input: AdminFriendCreateInput): Promise<Friend>;
  updateFriend(id: string, input: AdminFriendUpdateInput): Promise<Friend>;
  deleteFriend(id: string): Promise<void>;
}

export interface FriendServiceDeps {
  repository?: FriendRepository;
  notifications?: NotificationService;
  now?: () => Date;
  generateId?: () => string;
}

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.FRIEND_NOT_FOUND, "Friend not found", 404, {
    id,
  });

const createUrlConflictError = (url: string) =>
  new AppError(
    ERROR_CODES.FRIEND_URL_CONFLICT,
    "Friend URL already exists",
    409,
    {
      url,
    },
  );

const isDuplicateUrlError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";

export function createFriendService({
  repository = friendRepository,
  notifications = notificationService,
  now = () => new Date(),
  generateId = generateCuid,
}: FriendServiceDeps = {}): FriendService {
  return {
    listAdminFriends(query) {
      return repository.listAdmin(query);
    },
    listPublicFriends() {
      return repository.listPublic();
    },
    async getAdminFriend(id) {
      const friend = await repository.findById(id);

      if (!friend) {
        throw createNotFoundError(id);
      }

      return friend;
    },
    async createFriend(input) {
      const existingFriend = await repository.findByUrl(input.url);

      if (existingFriend) {
        throw createUrlConflictError(input.url);
      }

      const timestamp = now();
      const friend: NewFriend = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        name: input.name,
        url: input.url,
        avatar: normalizeNullableString(input.avatar) ?? "",
        description: normalizeNullableString(input.description) ?? "",
        category: input.category,
      };

      try {
        const createdFriend = await repository.create(friend);

        await notifications.safeCreateEvent({
          action: "created",
          entityType: "friend",
          entityId: createdFriend.id,
          entityTitle: createdFriend.name,
          description: `友链「${createdFriend.name}」已创建。`,
          href: "/admin/friends",
          metadata: {
            category: createdFriend.category,
            url: createdFriend.url,
          },
        });

        return createdFriend;
      } catch (error) {
        if (isDuplicateUrlError(error)) {
          throw createUrlConflictError(input.url);
        }

        throw error;
      }
    },
    async updateFriend(id, input) {
      const existingFriend = await repository.findById(id);

      if (!existingFriend) {
        throw createNotFoundError(id);
      }

      if (input.url && input.url !== existingFriend.url) {
        const duplicateFriend = await repository.findByUrl(input.url);

        if (duplicateFriend && duplicateFriend.id !== id) {
          throw createUrlConflictError(input.url);
        }
      }

      try {
        const updatedFriend = await repository.update(id, {
          name: input.name,
          url: input.url,
          avatar:
            input.avatar === undefined
              ? undefined
              : (normalizeNullableString(input.avatar) ?? ""),
          description:
            input.description === undefined
              ? undefined
              : (normalizeNullableString(input.description) ?? ""),
          category: input.category,
          updatedAt: now(),
        });

        if (!updatedFriend) {
          throw createNotFoundError(id);
        }

        await notifications.safeCreateEvent({
          action: "updated",
          entityType: "friend",
          entityId: updatedFriend.id,
          entityTitle: updatedFriend.name,
          description: `友链「${updatedFriend.name}」已更新。`,
          href: "/admin/friends",
          metadata: {
            category: updatedFriend.category,
            url: updatedFriend.url,
          },
        });

        return updatedFriend;
      } catch (error) {
        if (isDuplicateUrlError(error)) {
          throw createUrlConflictError(input.url ?? existingFriend.url);
        }

        throw error;
      }
    },
    async deleteFriend(id) {
      const existingFriend = await repository.findById(id);

      if (!existingFriend) {
        throw createNotFoundError(id);
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createNotFoundError(id);
      }

      await notifications.safeCreateEvent({
        action: "deleted",
        entityType: "friend",
        entityId: existingFriend.id,
        entityTitle: existingFriend.name,
        description: `友链「${existingFriend.name}」已删除。`,
        href: "/admin/friends",
        metadata: {
          category: existingFriend.category,
          url: existingFriend.url,
        },
      });
    },
  };
}

export const friendService = createFriendService();
