import { datetimeColumn, integerColumn, textColumn } from "@prisma/orm-sqlite/adapter/column-types";
import { defineContract, rel } from "@prisma/orm-sqlite/contract-builder";

export const contract = defineContract({}, ({ field, model }) => {
  const Admin = model("Admin", {
    fields: {
      id: field.column(integerColumn).id(),
      username: field.column(textColumn).unique(),
      passwordHash: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      updatedAt: field.column(datetimeColumn),
    },
  }).sql({
    table: "admin",
  });

  const Session = model("Session", {
    fields: {
      id: field.column(textColumn).id(),
      adminId: field.column(integerColumn),
      createdAt: field.column(datetimeColumn),
      expiresAt: field.column(datetimeColumn),
    },
  })
    .relations({ admin: rel.belongsTo(Admin, { from: "adminId", to: "id" }) })
    .sql(({ cols, constraints }) => ({
      table: "session",
      indexes: [constraints.index([cols.expiresAt])],
      foreignKeys: [constraints.foreignKey(cols.adminId, Admin.refs.id, { onDelete: "cascade" })],
    }));

  const LoginRateLimit = model("LoginRateLimit", {
    fields: {
      id: field.column(integerColumn).id(),
      window: field.column(integerColumn),
      count: field.column(integerColumn),
    },
  }).sql({ table: "login_rate_limit" });

  const Category = model("Category", {
    fields: {
      id: field.column(textColumn).id(),
      name: field.column(textColumn),
      nameKey: field.column(textColumn).unique(),
      color: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
    },
  })
    .relations({ posts: rel.hasMany("Post", { by: "categoryId" }) })
    .sql({ table: "category" });

  const Tag = model("Tag", {
    fields: {
      id: field.column(textColumn).id(),
      name: field.column(textColumn),
      nameKey: field.column(textColumn).unique(),
      createdAt: field.column(datetimeColumn),
    },
  })
    .relations({ postLinks: rel.hasMany("PostTag", { by: "tagId" }) })
    .sql({ table: "tag" });

  const Post = model("Post", {
    fields: {
      id: field.column(textColumn).id(),
      title: field.column(textColumn),
      slug: field.column(textColumn).unique(),
      slugLockedAt: field.column(datetimeColumn).optional(),
      content: field.column(textColumn),
      summary: field.column(textColumn).default(""),
      isFeatured: field.column(integerColumn).default(0),
      featuredOrder: field.column(integerColumn).default(0),
      categoryId: field.column(textColumn),
      status: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      updatedAt: field.column(datetimeColumn),
      publishedAt: field.column(datetimeColumn).optional(),
      scheduledFor: field.column(datetimeColumn).optional(),
      version: field.column(integerColumn),
    },
  })
    .relations({
      category: rel.belongsTo(Category, { from: "categoryId", to: "id" }),
      tagLinks: rel.hasMany("PostTag", { by: "postId" }),
      comments: rel.hasMany("Comment", { by: "postId" }),
    })
    .sql(({ cols, constraints }) => ({
      table: "post",
      indexes: [
        constraints.index([cols.createdAt, cols.id]),
        constraints.index([cols.categoryId]),
        constraints.index([cols.status, cols.scheduledFor]),
        constraints.index([cols.status, cols.publishedAt, cols.id]),
      ],
      foreignKeys: [
        constraints.foreignKey(cols.categoryId, Category.refs.id, { onDelete: "restrict" }),
      ],
    }));

  const PostTag = model("PostTag", {
    fields: { postId: field.column(textColumn), tagId: field.column(textColumn) },
  })
    .attributes(({ fields, constraints }) => ({
      id: constraints.id([fields.postId, fields.tagId]),
    }))
    .relations({
      post: rel.belongsTo(Post, { from: "postId", to: "id" }),
      tag: rel.belongsTo(Tag, { from: "tagId", to: "id" }),
    })
    .sql(({ cols, constraints }) => ({
      table: "post_tag",
      indexes: [constraints.index([cols.tagId])],
      foreignKeys: [
        constraints.foreignKey(cols.postId, Post.refs.id, { onDelete: "cascade" }),
        constraints.foreignKey(cols.tagId, Tag.refs.id, { onDelete: "restrict" }),
      ],
    }));

  const Media = model("Media", {
    fields: {
      id: field.column(textColumn).id(),
      adminId: field.column(integerColumn),
      name: field.column(textColumn),
      kind: field.column(textColumn),
      expectedBytes: field.column(integerColumn),
      sha256: field.column(textColumn),
      stagingKey: field.column(textColumn).unique(),
      stagingCleanedAt: field.column(datetimeColumn).optional(),
      objectKey: field.column(textColumn).unique(),
      bytes: field.column(integerColumn).optional(),
      mime: field.column(textColumn).optional(),
      width: field.column(integerColumn).optional(),
      height: field.column(integerColumn).optional(),
      status: field.column(textColumn),
      leaseToken: field.column(textColumn).optional(),
      leaseUntil: field.column(datetimeColumn).optional(),
      createdAt: field.column(datetimeColumn),
      uploadedAt: field.column(datetimeColumn).optional(),
      expiresAt: field.column(datetimeColumn),
      deletedAt: field.column(datetimeColumn).optional(),
    },
  }).sql(({ cols, constraints }) => ({
    table: "media",
    indexes: [
      constraints.index([cols.status, cols.expiresAt]),
      constraints.index([cols.createdAt, cols.id]),
    ],
    foreignKeys: [constraints.foreignKey(cols.adminId, Admin.refs.id, { onDelete: "restrict" })],
  }));
  const MediaUploadLimit = model("MediaUploadLimit", {
    fields: {
      adminId: field.column(integerColumn).id(),
      window: field.column(integerColumn),
      count: field.column(integerColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "media_upload_limit",
    foreignKeys: [constraints.foreignKey(cols.adminId, Admin.refs.id, { onDelete: "cascade" })],
  }));

  const CommentBase = model("Comment", {
    fields: {
      id: field.column(textColumn).id(),
      postId: field.column(textColumn),
      parentId: field.column(textColumn).optional(),
      adminId: field.column(integerColumn).optional(),
      author: field.column(textColumn),
      authorKind: field.column(textColumn),
      submissionId: field.column(textColumn).optional().unique(),
      submissionHash: field.column(textColumn).optional(),
      email: field.column(textColumn).optional(),
      content: field.column(textColumn),
      status: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      updatedAt: field.column(datetimeColumn),
      version: field.column(integerColumn),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.id, fields.postId])],
  }));
  const Comment = CommentBase.relations({
    post: rel.belongsTo(Post, { from: "postId", to: "id" }),
    parent: rel.belongsTo("Comment", { from: "parentId", to: "id" }),
    replies: rel.hasMany("Comment", { by: "parentId" }),
    admin: rel.belongsTo(Admin, { from: "adminId", to: "id" }),
  }).sql(({ cols, constraints }) => ({
    table: "comment",
    indexes: [
      constraints.index([cols.createdAt, cols.id]),
      constraints.index([cols.status, cols.createdAt, cols.id]),
      constraints.index([cols.postId]),
      constraints.index([cols.parentId]),
    ],
    foreignKeys: [
      constraints.foreignKey(cols.postId, Post.refs.id, { onDelete: "cascade" }),
      constraints.foreignKey(
        [cols.parentId, cols.postId],
        [CommentBase.refs.id, CommentBase.refs.postId],
        { onDelete: "cascade" },
      ),
      constraints.foreignKey(cols.adminId, Admin.refs.id, { onDelete: "setNull" }),
    ],
  }));

  const CommentRateLimit = model("CommentRateLimit", {
    fields: {
      id: field.column(textColumn).id(),
      window: field.column(integerColumn),
      count: field.column(integerColumn),
      expiresAt: field.column(datetimeColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "comment_rate_limit",
    indexes: [constraints.index([cols.expiresAt])],
  }));

  const SiteSetting = model("SiteSetting", {
    fields: {
      id: field.column(integerColumn).id(),
      title: field.column(textColumn),
      subtitle: field.column(textColumn),
      authorName: field.column(textColumn),
      authorRole: field.column(textColumn),
      avatarUrl: field.column(textColumn),
      aboutMe: field.column(textColumn),
      postsPerPage: field.column(integerColumn),
      enableComments: field.column(integerColumn),
      icpText: field.column(textColumn),
      icpUrl: field.column(textColumn),
      policeText: field.column(textColumn),
      policeUrl: field.column(textColumn),
      localAnalyticsEnabled: field.column(integerColumn).optional(),
      localAnalyticsStartedAt: field.column(datetimeColumn).optional(),
      googleEnabled: field.column(integerColumn),
      googleId: field.column(textColumn),
      baiduEnabled: field.column(integerColumn),
      baiduId: field.column(textColumn),
      version: field.column(integerColumn),
      updatedAt: field.column(datetimeColumn),
    },
  }).sql({ table: "site_setting" });
  const SocialAccount = model("SocialAccount", {
    fields: {
      id: field.column(textColumn).id(),
      settingId: field.column(integerColumn),
      label: field.column(textColumn),
      url: field.column(textColumn),
      icon: field.column(textColumn),
      imageUrl: field.column(textColumn),
      enabled: field.column(integerColumn),
      position: field.column(integerColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "social_account",
    indexes: [constraints.index([cols.settingId, cols.position])],
    foreignKeys: [
      constraints.foreignKey(cols.settingId, SiteSetting.refs.id, { onDelete: "cascade" }),
    ],
  }));

  const FriendLink = model("FriendLink", {
    fields: {
      id: field.column(textColumn).id(),
      name: field.column(textColumn),
      url: field.column(textColumn),
      avatar: field.column(textColumn),
      description: field.column(textColumn),
      category: field.column(textColumn),
      status: field.column(textColumn),
      enabled: field.column(integerColumn),
      version: field.column(integerColumn),
      createdAt: field.column(datetimeColumn),
      updatedAt: field.column(datetimeColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "friend_link",
    indexes: [
      constraints.index([cols.createdAt, cols.id]),
      constraints.index([cols.status, cols.enabled]),
    ],
  }));

  const ReleaseLog = model("ReleaseLog", {
    fields: {
      id: field.column(textColumn).id(),
      version: field.column(textColumn),
      title: field.column(textColumn),
      type: field.column(textColumn),
      changes: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "release_log",
    indexes: [constraints.index([cols.createdAt, cols.id])],
  }));

  const VisitSession = model("VisitSession", {
    fields: {
      id: field.column(textColumn).id(),
      visitorHash: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      lastSeenAt: field.column(datetimeColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "visit_session",
    indexes: [
      constraints.index([cols.visitorHash, cols.lastSeenAt]),
      constraints.index([cols.createdAt]),
      constraints.index([cols.lastSeenAt]),
    ],
  }));
  const PageVisit = model("PageVisit", {
    fields: {
      id: field.column(textColumn).id(),
      visitorHash: field.column(textColumn),
      sessionId: field.column(textColumn),
      path: field.column(textColumn),
      postId: field.column(textColumn).optional(),
      article: field.column(integerColumn),
      source: field.column(textColumn),
      referrerHost: field.column(textColumn),
      device: field.column(textColumn),
      browser: field.column(textColumn),
      os: field.column(textColumn),
      ip: field.column(textColumn),
      location: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      lastSeenAt: field.column(datetimeColumn),
      durationMs: field.column(integerColumn),
      progress: field.column(integerColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "page_visit",
    indexes: [
      constraints.index([cols.createdAt, cols.id]),
      constraints.index([cols.visitorHash, cols.lastSeenAt]),
      constraints.index([cols.sessionId]),
      constraints.index([cols.postId, cols.createdAt]),
      constraints.index([cols.lastSeenAt]),
    ],
    foreignKeys: [
      constraints.foreignKey(cols.sessionId, VisitSession.refs.id, { onDelete: "cascade" }),
      constraints.foreignKey(cols.postId, Post.refs.id, { onDelete: "setNull" }),
    ],
  }));
  const AnalyticsRateLimit = model("AnalyticsRateLimit", {
    fields: {
      id: field.column(textColumn).id(),
      window: field.column(integerColumn),
      count: field.column(integerColumn),
      expiresAt: field.column(datetimeColumn),
    },
  }).sql(({ cols, constraints }) => ({
    table: "analytics_rate_limit",
    indexes: [constraints.index([cols.expiresAt])],
  }));

  const Notification = model("Notification", {
    fields: {
      id: field.column(textColumn).id(),
      kind: field.column(textColumn),
      sourceId: field.column(textColumn).optional(),
      title: field.column(textColumn),
      href: field.column(textColumn),
      createdAt: field.column(datetimeColumn),
      resolvedAt: field.column(datetimeColumn).optional(),
    },
  }).sql(({ cols, constraints }) => ({
    table: "notification",
    indexes: [constraints.index([cols.createdAt, cols.id])],
  }));
  const NotificationRead = model("NotificationRead", {
    fields: {
      notificationId: field.column(textColumn),
      adminId: field.column(integerColumn),
      readAt: field.column(datetimeColumn),
    },
  })
    .attributes(({ fields, constraints }) => ({
      id: constraints.id([fields.notificationId, fields.adminId]),
    }))
    .sql(({ cols, constraints }) => ({
      table: "notification_read",
      foreignKeys: [
        constraints.foreignKey(cols.notificationId, Notification.refs.id, { onDelete: "cascade" }),
        constraints.foreignKey(cols.adminId, Admin.refs.id, { onDelete: "cascade" }),
      ],
    }));
  const OperationSetting = model("OperationSetting", {
    fields: {
      id: field.column(integerColumn).id(),
      autoBackup: field.column(integerColumn),
      version: field.column(integerColumn),
      schedulerLastRunAt: field.column(datetimeColumn).optional(),
      updatedAt: field.column(datetimeColumn),
    },
  }).sql({ table: "operation_setting" });
  const BackupRun = model("BackupRun", {
    fields: {
      id: field.column(textColumn).id(),
      dailyKey: field.column(textColumn).optional().unique(),
      status: field.column(textColumn),
      bytes: field.column(integerColumn).optional(),
      sha256: field.column(textColumn).optional(),
      createdAt: field.column(datetimeColumn),
      finishedAt: field.column(datetimeColumn).optional(),
    },
  }).sql(({ cols, constraints }) => ({
    table: "backup_run",
    indexes: [constraints.index([cols.createdAt, cols.id])],
  }));

  return {
    models: {
      Admin,
      Session,
      LoginRateLimit,
      Category,
      Tag,
      Post,
      PostTag,
      Media,
      MediaUploadLimit,
      Comment,
      CommentRateLimit,
      SiteSetting,
      SocialAccount,
      FriendLink,
      ReleaseLog,
      VisitSession,
      PageVisit,
      AnalyticsRateLimit,
      Notification,
      NotificationRead,
      OperationSetting,
      BackupRun,
    },
  };
});
