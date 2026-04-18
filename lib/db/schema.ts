import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("categories_slug_key"),
  description: text("description").notNull(),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("tags_slug_key"),
  description: text("description").notNull(),
});

export const blogs = pgTable(
  "blogs",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique("blogs_slug_key"),
    description: text("description").notNull(),
    cover: text("cover").notNull().default(""),
    content: text("content").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", {
      mode: "date",
      withTimezone: true,
    }),
    featured: boolean("featured").notNull().default(false),
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
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.blogId, table.tagId],
      name: "blog_tags_pkey",
    }),
    index("blog_tags_tag_id_idx").on(table.tagId),
  ],
);

export const changelogs = pgTable(
  "changelogs",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    version: text("version").notNull().unique("changelogs_version_key"),
    content: text("content").notNull(),
    releaseDate: date("release_date", { mode: "string" }),
  },
  (table) => [
    index("changelogs_release_date_idx").on(table.releaseDate.desc()),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  blogs: many(blogs),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  blogTags: many(blogTags),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  category: one(categories, {
    fields: [blogs.categoryId],
    references: [categories.id],
  }),
  blogTags: many(blogTags),
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

export const schema = {
  categories,
  tags,
  blogs,
  blogTags,
  changelogs,
};

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type BlogTag = typeof blogTags.$inferSelect;
export type NewBlogTag = typeof blogTags.$inferInsert;
export type Changelog = typeof changelogs.$inferSelect;
export type NewChangelog = typeof changelogs.$inferInsert;
