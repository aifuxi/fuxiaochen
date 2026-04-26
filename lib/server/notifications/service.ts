import { generateCuid } from "@/lib/cuid";
import type {
  NewNotification,
  Notification,
  NotificationAction,
  NotificationEntityType,
  NotificationType,
} from "@/lib/db/schema";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import type {
  AdminNotificationListQuery,
  AdminNotificationReadInput,
} from "@/lib/server/notifications/dto";

import { routes } from "@/constants/routes";

import { notificationRepository } from "./repository";

export type NotificationListResult = {
  items: Notification[];
  total: number;
  unreadCount: number;
};

export type NotificationEventInput = {
  action: NotificationAction;
  actorUserId?: string | null;
  description?: string;
  entityId: string;
  entityTitle: string;
  entityType: NotificationEntityType;
  href?: string;
  metadata?: Record<string, unknown>;
};

export interface NotificationRepository {
  list(query: AdminNotificationListQuery): Promise<{
    items: Notification[];
    total: number;
  }>;
  countUnread(): Promise<number>;
  create(notification: NewNotification): Promise<Notification>;
  updateReadState(
    id: string,
    readAt: Date | null,
    updatedAt: Date,
  ): Promise<Notification | null>;
  markAllRead(readAt: Date): Promise<number>;
}

export interface NotificationService {
  listNotifications(
    query: AdminNotificationListQuery,
  ): Promise<NotificationListResult>;
  createEvent(input: NotificationEventInput): Promise<Notification>;
  safeCreateEvent(input: NotificationEventInput): Promise<void>;
  updateReadState(
    id: string,
    input: AdminNotificationReadInput,
  ): Promise<Notification>;
  markAllRead(): Promise<number>;
}

export interface NotificationServiceDeps {
  repository?: NotificationRepository;
  now?: () => Date;
  generateId?: () => string;
}

const typeByEntity = {
  blog: "content",
  changelog: "content",
  comment: "interaction",
  friend: "content",
  project: "content",
  user: "user",
} satisfies Record<NotificationEntityType, NotificationType>;

const entityLabels = {
  blog: "文章",
  changelog: "更新日志",
  comment: "评论",
  friend: "友链",
  project: "项目",
  user: "用户",
} satisfies Record<NotificationEntityType, string>;

const actionLabels = {
  created: "已创建",
  updated: "已更新",
  deleted: "已删除",
} satisfies Record<NotificationAction, string>;

const getDefaultHref = (input: NotificationEventInput) => {
  if (input.href !== undefined) {
    return input.href;
  }

  switch (input.entityType) {
    case "blog":
      return routes.admin.posts;
    case "changelog":
      return routes.admin.changelog;
    case "comment":
      return routes.admin.comments;
    case "friend":
      return routes.admin.friends;
    case "project":
      return routes.admin.root;
    case "user":
      return routes.admin.users;
  }
};

const getDefaultTitle = ({
  action,
  entityType,
}: Pick<NotificationEventInput, "action" | "entityType">) =>
  `${entityLabels[entityType]}${actionLabels[action]}`;

export function createNotificationService({
  repository = notificationRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: NotificationServiceDeps = {}): NotificationService {
  return {
    async listNotifications(query) {
      const [result, unreadCount] = await Promise.all([
        repository.list(query),
        repository.countUnread(),
      ]);

      return {
        ...result,
        unreadCount,
      };
    },
    createEvent(input) {
      const timestamp = now();

      return repository.create({
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        type: typeByEntity[input.entityType],
        action: input.action,
        title: getDefaultTitle(input),
        description: input.description ?? input.entityTitle,
        href: getDefaultHref(input),
        entityType: input.entityType,
        entityId: input.entityId,
        actorUserId: input.actorUserId ?? null,
        metadata: input.metadata ?? {},
        readAt: null,
      });
    },
    async safeCreateEvent(input) {
      try {
        await this.createEvent(input);
      } catch {
        // Notification writes must not break the business mutation path.
      }
    },
    async updateReadState(id, input) {
      const timestamp = now();
      const notification = await repository.updateReadState(
        id,
        input.read ? timestamp : null,
        timestamp,
      );

      if (!notification) {
        throw new AppError(
          ERROR_CODES.NOTIFICATION_NOT_FOUND,
          "Notification not found",
          404,
          { id },
        );
      }

      return notification;
    },
    markAllRead() {
      return repository.markAllRead(now());
    },
  };
}

export const notificationService = createNotificationService();
