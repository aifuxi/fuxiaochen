import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import type {
  SiteSettingsCompliance,
  SiteSettingsGeneral,
  SiteSettingsProfile,
  SiteSettingsSeo,
  SiteSettingsSocial,
} from "@/lib/settings/types";

export type ChangelogType = "feature" | "improvement" | "bugfix" | "breaking";
export type CommentStatus = "pending" | "approved" | "spam";
export type FriendCategory = "developer" | "designer" | "blogger" | "creator";
export type UserRole = "admin" | "user";

const createTimestampColumns = () => ({
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  ...createTimestampColumns(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("categories_slug_key"),
  description: text("description").notNull().default(""),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  ...createTimestampColumns(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("tags_slug_key"),
  description: text("description").notNull().default(""),
});

export const blogs = pgTable(
  "blogs",
  {
    id: text("id").primaryKey(),
    ...createTimestampColumns(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique("blogs_slug_key"),
    description: text("description").notNull(),
    content: text("content").notNull(),
    coverImage: text("cover_image").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", {
      mode: "date",
      withTimezone: true,
    }),
    readTimeMinutes: integer("read_time_minutes").notNull().default(1),
    categoryId: text("category_id").notNull(),
  },
  (table) => [
    foreignKey({
      name: "blogs_category_id_fkey",
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }),
    index("blogs_category_id_idx").on(table.categoryId),
    index("blogs_published_published_at_idx").on(
      table.published,
      table.publishedAt.desc(),
    ),
  ],
);

export const blogTags = pgTable(
  "blog_tags",
  {
    blogId: text("blog_id").notNull(),
    tagId: text("tag_id").notNull(),
  },
  (table) => [
    foreignKey({
      name: "blog_tags_blog_id_fkey",
      columns: [table.blogId],
      foreignColumns: [blogs.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "blog_tags_tag_id_fkey",
      columns: [table.tagId],
      foreignColumns: [tags.id],
    }),
    primaryKey({
      columns: [table.blogId, table.tagId],
      name: "blog_tags_pkey",
    }),
    index("blog_tags_tag_id_idx").on(table.tagId),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    ...createTimestampColumns(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique("projects_slug_key"),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),
    image: text("image").notNull().default(""),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    year: integer("year").notNull(),
  },
  (table) => [
    index("projects_published_year_idx").on(table.published, table.year.desc()),
  ],
);

export const friends = pgTable(
  "friends",
  {
    id: text("id").primaryKey(),
    ...createTimestampColumns(),
    name: text("name").notNull(),
    url: text("url").notNull().unique("friends_url_key"),
    avatar: text("avatar").notNull().default(""),
    description: text("description").notNull().default(""),
    category: text("category").$type<FriendCategory>().notNull(),
  },
  (table) => [
    index("friends_category_name_idx").on(table.category, table.name),
    index("friends_updated_at_idx").on(table.updatedAt.desc()),
  ],
);

export const changelogs = pgTable(
  "changelogs",
  {
    id: text("id").primaryKey(),
    ...createTimestampColumns(),
    version: text("version").notNull().unique("changelogs_version_key"),
    title: text("title").notNull(),
    releaseDate: timestamp("release_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    type: text("type").$type<ChangelogType>().notNull(),
    description: text("description").notNull(),
    changes: text("changes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
  },
  (table) => [
    index("changelogs_release_date_idx").on(table.releaseDate.desc()),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    ...createTimestampColumns(),
    blogId: text("blog_id").notNull(),
    parentId: text("parent_id"),
    author: text("author").notNull(),
    email: text("email").notNull(),
    content: text("content").notNull(),
    avatar: text("avatar"),
    status: text("status").$type<CommentStatus>().notNull().default("pending"),
  },
  (table) => [
    foreignKey({
      name: "comments_blog_id_fkey",
      columns: [table.blogId],
      foreignColumns: [blogs.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "comments_parent_id_fkey",
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
    index("comments_blog_id_status_created_at_idx").on(
      table.blogId,
      table.status,
      table.createdAt.desc(),
    ),
    index("comments_parent_id_idx").on(table.parentId),
    index("comments_status_created_at_idx").on(
      table.status,
      table.createdAt.desc(),
    ),
  ],
);

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique("user_email_key"),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").$type<UserRole>().notNull().default("user"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [index("user_role_idx").on(table.role)],
);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  general: jsonb("general").$type<SiteSettingsGeneral>().notNull(),
  seo: jsonb("seo").$type<SiteSettingsSeo>().notNull(),
  profile: jsonb("profile").$type<SiteSettingsProfile>().notNull(),
  social: jsonb("social").$type<SiteSettingsSocial>().notNull(),
  compliance: jsonb("compliance").$type<SiteSettingsCompliance>().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    token: text("token").notNull().unique("session_token_key"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      name: "session_user_id_fkey",
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    foreignKey({
      name: "account_user_id_fkey",
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("account_user_id_idx").on(table.userId),
    index("account_provider_id_account_id_idx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  blogs: many(blogs),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  blogTags: many(blogTags),
}));

export const blogsRelations = relations(blogs, ({ many, one }) => ({
  category: one(categories, {
    fields: [blogs.categoryId],
    references: [categories.id],
  }),
  blogTags: many(blogTags),
  comments: many(comments),
}));

export const blogTagsRelations = relations(blogTags, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogTags.blogId],
    references: [blogs.id],
  }),
  tag: one(tags, {
    fields: [blogTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ many, one }) => ({
  blog: one(blogs, {
    fields: [comments.blogId],
    references: [blogs.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, {
    relationName: "comment_replies",
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const schema = {
  account: accounts,
  accounts,
  blogs,
  blogTags,
  categories,
  changelogs,
  comments,
  friends,
  projects,
  session: sessions,
  sessions,
  siteSettings,
  tags,
  user: users,
  users,
  verification: verifications,
  verifications,
};

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type BlogTag = typeof blogTags.$inferSelect;
export type NewBlogTag = typeof blogTags.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Friend = typeof friends.$inferSelect;
export type NewFriend = typeof friends.$inferInsert;
export type Changelog = typeof changelogs.$inferSelect;
export type NewChangelog = typeof changelogs.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type NewSiteSettingsRow = typeof siteSettings.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
