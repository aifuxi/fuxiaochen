import {
  customType,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

import { sessionTokens, sessionTokenHash } from "@/lib/auth/storage-context";

// SQL 整数在读写两端校验，保持原服务的安全 JavaScript number 范围。
function checkedInteger(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error("数据库整数超出安全范围。");
  return value;
}
const safeInteger = customType<{ data: number; driverData: number }>({
  dataType: () => "integer",
  toDriver: checkedInteger,
  fromDriver: checkedInteger,
});
// SQLite 统一保存 UTC 毫秒，业务代码继续读取 Date，不改变 API 日期格式。
const datetime = customType<{ data: Date; driverData: number }>({
  dataType: () => "integer",
  toDriver: (value) => checkedInteger(value.getTime()),
  fromDriver: (value) => {
    const date = new Date(checkedInteger(value));
    if (Number.isNaN(date.getTime())) throw new Error("数据库日期无效。");
    return date;
  },
});

export const admin = sqliteTable("admin", {
  id: safeInteger("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: datetime("createdAt").notNull(),
  updatedAt: datetime("updatedAt").notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    adminId: safeInteger("adminId").notNull(),
    createdAt: datetime("createdAt").notNull(),
    expiresAt: datetime("expiresAt").notNull(),
  },
  (t) => [
    index("session_expiresAt_idx").on(t.expiresAt),
    foreignKey({ columns: [t.adminId], foreignColumns: [admin.id] }).onDelete("cascade"),
  ],
);

export const loginRateLimit = sqliteTable("login_rate_limit", {
  id: safeInteger("id").primaryKey(),
  window: safeInteger("window").notNull(),
  count: safeInteger("count").notNull(),
});

// 原 admin/session 保留为旧库导入基线；实际认证只使用下列 Better Auth 表。
export const authUser = sqliteTable("auth_user", {
  id: safeInteger("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: customType<{ data: boolean; driverData: number }>({
    dataType: () => "integer",
    toDriver: (value) => (value ? 1 : 0),
    fromDriver: (value) => value === 1,
  })("emailVerified").notNull(),
  image: text("image"),
  username: text("username").notNull().unique(),
  createdAt: datetime("createdAt").notNull(),
  updatedAt: datetime("updatedAt").notNull(),
});

const sessionToken = customType<{ data: string; driverData: string }>({
  dataType: () => "text",
  toDriver: (token) => {
    const hash = sessionTokenHash(token);
    sessionTokens.getStore()?.set(hash, token);
    return hash;
  },
  fromDriver: (hash) => sessionTokens.getStore()?.get(hash) ?? hash,
});
export const authSession = sqliteTable(
  "auth_session",
  {
    id: safeInteger("id").primaryKey(),
    userId: safeInteger("userId")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    token: sessionToken("token").notNull().unique(),
    expiresAt: datetime("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
  },
  (t) => [
    index("auth_session_userId_idx").on(t.userId),
    index("auth_session_expiresAt_idx").on(t.expiresAt),
  ],
);

export const authAccount = sqliteTable(
  "auth_account",
  {
    id: safeInteger("id").primaryKey(),
    userId: safeInteger("userId")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    password: text("password"),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: datetime("accessTokenExpiresAt"),
    refreshTokenExpiresAt: datetime("refreshTokenExpiresAt"),
    scope: text("scope"),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
  },
  (t) => [
    index("auth_account_userId_idx").on(t.userId),
    unique("auth_account_provider_account_unique").on(t.providerId, t.accountId),
  ],
);

export const authVerification = sqliteTable(
  "auth_verification",
  {
    id: safeInteger("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: datetime("expiresAt").notNull(),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
  },
  (t) => [index("auth_verification_identifier_idx").on(t.identifier)],
);

// 私钥留在认证器或系统密码管理器，服务端只保存公钥及签名计数。
export const authPasskey = sqliteTable(
  "auth_passkey",
  {
    id: safeInteger("id").primaryKey(),
    userId: safeInteger("userId")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    name: text("name"),
    publicKey: text("publicKey").notNull(),
    credentialID: text("credentialID").notNull().unique(),
    counter: safeInteger("counter").notNull(),
    deviceType: text("deviceType").notNull(),
    backedUp: integer("backedUp", { mode: "boolean" }).notNull(),
    transports: text("transports"),
    createdAt: datetime("createdAt"),
    aaguid: text("aaguid"),
  },
  (t) => [index("auth_passkey_userId_idx").on(t.userId)],
);

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameKey: text("nameKey").notNull().unique(),
  color: text("color").notNull(),
  createdAt: datetime("createdAt").notNull(),
});

export const tag = sqliteTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameKey: text("nameKey").notNull().unique(),
  createdAt: datetime("createdAt").notNull(),
});

export const post = sqliteTable(
  "post",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").unique(),
    slugLockedAt: datetime("slugLockedAt"),
    content: text("content").notNull(),
    summary: text("summary").notNull().default(""),
    isFeatured: safeInteger("isFeatured").notNull().default(0),
    featuredOrder: safeInteger("featuredOrder").notNull().default(0),
    categoryId: text("categoryId"),
    status: text("status").notNull(),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
    publishedAt: datetime("publishedAt"),
    scheduledFor: datetime("scheduledFor"),
    version: safeInteger("version").notNull(),
  },
  (t) => [
    index("post_createdAt_id_idx").on(t.createdAt, t.id),
    index("post_categoryId_idx").on(t.categoryId),
    index("post_status_scheduledFor_idx").on(t.status, t.scheduledFor),
    index("post_status_publishedAt_id_idx").on(t.status, t.publishedAt, t.id),
    foreignKey({ columns: [t.categoryId], foreignColumns: [category.id] }).onDelete("restrict"),
  ],
);

export const postTag = sqliteTable(
  "post_tag",
  {
    postId: text("postId").notNull(),
    tagId: text("tagId").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.tagId] }),
    index("post_tag_tagId_idx").on(t.tagId),
    foreignKey({ columns: [t.postId], foreignColumns: [post.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.tagId], foreignColumns: [tag.id] }).onDelete("restrict"),
  ],
);

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    adminId: safeInteger("adminId").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    expectedBytes: safeInteger("expectedBytes").notNull(),
    sha256: text("sha256").notNull(),
    stagingKey: text("stagingKey").notNull().unique(),
    stagingCleanedAt: datetime("stagingCleanedAt"),
    objectKey: text("objectKey").notNull().unique(),
    bytes: safeInteger("bytes"),
    mime: text("mime"),
    width: safeInteger("width"),
    height: safeInteger("height"),
    status: text("status").notNull(),
    leaseToken: text("leaseToken"),
    leaseUntil: datetime("leaseUntil"),
    createdAt: datetime("createdAt").notNull(),
    uploadedAt: datetime("uploadedAt"),
    expiresAt: datetime("expiresAt").notNull(),
    deletedAt: datetime("deletedAt"),
  },
  (t) => [
    index("media_status_expiresAt_idx").on(t.status, t.expiresAt),
    index("media_createdAt_id_idx").on(t.createdAt, t.id),
    foreignKey({ columns: [t.adminId], foreignColumns: [admin.id] }).onDelete("restrict"),
  ],
);

export const mediaUploadLimit = sqliteTable(
  "media_upload_limit",
  {
    adminId: safeInteger("adminId").primaryKey(),
    window: safeInteger("window").notNull(),
    count: safeInteger("count").notNull(),
  },
  (t) => [foreignKey({ columns: [t.adminId], foreignColumns: [admin.id] }).onDelete("cascade")],
);

export const comment = sqliteTable(
  "comment",
  {
    id: text("id").primaryKey(),
    postId: text("postId").notNull(),
    parentId: text("parentId"),
    adminId: safeInteger("adminId"),
    author: text("author").notNull(),
    authorKind: text("authorKind").notNull(),
    submissionId: text("submissionId").unique(),
    submissionHash: text("submissionHash"),
    email: text("email"),
    content: text("content").notNull(),
    status: text("status").notNull(),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
    version: safeInteger("version").notNull(),
  },
  (t) => [
    unique("comment_id_postId_unique").on(t.id, t.postId),
    index("comment_createdAt_id_idx").on(t.createdAt, t.id),
    index("comment_status_createdAt_id_idx").on(t.status, t.createdAt, t.id),
    index("comment_postId_idx").on(t.postId),
    index("comment_parentId_idx").on(t.parentId),
    foreignKey({ columns: [t.postId], foreignColumns: [post.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.parentId, t.postId], foreignColumns: [t.id, t.postId] }).onDelete(
      "cascade",
    ),
    foreignKey({ columns: [t.adminId], foreignColumns: [admin.id] }).onDelete("set null"),
  ],
);

export const commentRateLimit = sqliteTable(
  "comment_rate_limit",
  {
    id: text("id").primaryKey(),
    window: safeInteger("window").notNull(),
    count: safeInteger("count").notNull(),
    expiresAt: datetime("expiresAt").notNull(),
  },
  (t) => [index("comment_rate_limit_expiresAt_idx").on(t.expiresAt)],
);

export const siteSetting = sqliteTable("site_setting", {
  id: safeInteger("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  seoDescription: text("seoDescription"),
  ogImageUrl: text("ogImageUrl"),
  googleVerification: text("googleVerification"),
  bingVerification: text("bingVerification"),
  baiduVerification: text("baiduVerification"),
  authorName: text("authorName").notNull(),
  authorRole: text("authorRole").notNull(),
  avatarUrl: text("avatarUrl").notNull(),
  aboutMe: text("aboutMe").notNull(),
  postsPerPage: safeInteger("postsPerPage").notNull(),
  enableComments: safeInteger("enableComments").notNull(),
  icpText: text("icpText").notNull(),
  icpUrl: text("icpUrl").notNull(),
  policeText: text("policeText").notNull(),
  policeUrl: text("policeUrl").notNull(),
  localAnalyticsEnabled: safeInteger("localAnalyticsEnabled"),
  localAnalyticsStartedAt: datetime("localAnalyticsStartedAt"),
  googleEnabled: safeInteger("googleEnabled").notNull(),
  googleId: text("googleId").notNull(),
  baiduEnabled: safeInteger("baiduEnabled").notNull(),
  baiduId: text("baiduId").notNull(),
  version: safeInteger("version").notNull(),
  updatedAt: datetime("updatedAt").notNull(),
});

export const socialAccount = sqliteTable(
  "social_account",
  {
    id: text("id").primaryKey(),
    settingId: safeInteger("settingId").notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    icon: text("icon").notNull(),
    imageUrl: text("imageUrl").notNull(),
    enabled: safeInteger("enabled").notNull(),
    position: safeInteger("position").notNull(),
  },
  (t) => [
    index("social_account_settingId_position_idx").on(t.settingId, t.position),
    foreignKey({ columns: [t.settingId], foreignColumns: [siteSetting.id] }).onDelete("cascade"),
  ],
);

export const friendLink = sqliteTable(
  "friend_link",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    avatar: text("avatar").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull(),
    enabled: safeInteger("enabled").notNull(),
    version: safeInteger("version").notNull(),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
  },
  (t) => [
    index("friend_link_createdAt_id_idx").on(t.createdAt, t.id),
    index("friend_link_status_enabled_idx").on(t.status, t.enabled),
  ],
);

export const releaseLog = sqliteTable(
  "release_log",
  {
    id: text("id").primaryKey(),
    version: text("version").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    changes: text("changes").notNull(),
    status: text("status").notNull().default("published"),
    revision: safeInteger("revision").notNull().default(1),
    updatedAt: datetime("updatedAt"),
    createdAt: datetime("createdAt").notNull(),
  },
  (t) => [index("release_log_createdAt_id_idx").on(t.createdAt, t.id)],
);

export const visitSession = sqliteTable(
  "visit_session",
  {
    id: text("id").primaryKey(),
    visitorHash: text("visitorHash").notNull(),
    createdAt: datetime("createdAt").notNull(),
    lastSeenAt: datetime("lastSeenAt").notNull(),
  },
  (t) => [
    index("visit_session_visitorHash_lastSeenAt_idx").on(t.visitorHash, t.lastSeenAt),
    index("visit_session_createdAt_idx").on(t.createdAt),
    index("visit_session_lastSeenAt_idx").on(t.lastSeenAt),
  ],
);

export const pageVisit = sqliteTable(
  "page_visit",
  {
    id: text("id").primaryKey(),
    visitorHash: text("visitorHash").notNull(),
    sessionId: text("sessionId").notNull(),
    path: text("path").notNull(),
    postId: text("postId"),
    article: safeInteger("article").notNull(),
    source: text("source").notNull(),
    referrerHost: text("referrerHost").notNull(),
    device: text("device").notNull(),
    browser: text("browser").notNull(),
    os: text("os").notNull(),
    ip: text("ip").notNull(),
    location: text("location").notNull(),
    createdAt: datetime("createdAt").notNull(),
    lastSeenAt: datetime("lastSeenAt").notNull(),
    durationMs: safeInteger("durationMs").notNull(),
    progress: safeInteger("progress").notNull(),
  },
  (t) => [
    index("page_visit_createdAt_id_idx").on(t.createdAt, t.id),
    index("page_visit_visitorHash_lastSeenAt_idx").on(t.visitorHash, t.lastSeenAt),
    index("page_visit_sessionId_idx").on(t.sessionId),
    index("page_visit_postId_createdAt_idx").on(t.postId, t.createdAt),
    index("page_visit_lastSeenAt_idx").on(t.lastSeenAt),
    foreignKey({ columns: [t.sessionId], foreignColumns: [visitSession.id] }).onDelete("cascade"),
    foreignKey({ columns: [t.postId], foreignColumns: [post.id] }).onDelete("set null"),
  ],
);

export const analyticsRateLimit = sqliteTable(
  "analytics_rate_limit",
  {
    id: text("id").primaryKey(),
    window: safeInteger("window").notNull(),
    count: safeInteger("count").notNull(),
    expiresAt: datetime("expiresAt").notNull(),
  },
  (t) => [index("analytics_rate_limit_expiresAt_idx").on(t.expiresAt)],
);

export const notification = sqliteTable(
  "notification",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    sourceId: text("sourceId"),
    title: text("title").notNull(),
    href: text("href").notNull(),
    createdAt: datetime("createdAt").notNull(),
    resolvedAt: datetime("resolvedAt"),
  },
  (t) => [index("notification_createdAt_id_idx").on(t.createdAt, t.id)],
);

export const notificationRead = sqliteTable(
  "notification_read",
  {
    notificationId: text("notificationId").notNull(),
    adminId: safeInteger("adminId").notNull(),
    readAt: datetime("readAt").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.notificationId, t.adminId] }),
    foreignKey({ columns: [t.notificationId], foreignColumns: [notification.id] }).onDelete(
      "cascade",
    ),
    foreignKey({ columns: [t.adminId], foreignColumns: [admin.id] }).onDelete("cascade"),
  ],
);

export const operationSetting = sqliteTable("operation_setting", {
  id: safeInteger("id").primaryKey(),
  autoBackup: safeInteger("autoBackup").notNull(),
  version: safeInteger("version").notNull(),
  schedulerLastRunAt: datetime("schedulerLastRunAt"),
  updatedAt: datetime("updatedAt").notNull(),
});

export const backupRun = sqliteTable(
  "backup_run",
  {
    id: text("id").primaryKey(),
    dailyKey: text("dailyKey").unique(),
    status: text("status").notNull(),
    bytes: safeInteger("bytes"),
    sha256: text("sha256"),
    createdAt: datetime("createdAt").notNull(),
    finishedAt: datetime("finishedAt"),
  },
  (t) => [index("backup_run_createdAt_id_idx").on(t.createdAt, t.id)],
);
