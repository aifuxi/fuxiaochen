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
      content: field.column(textColumn),
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
    })
    .sql(({ cols, constraints }) => ({
      table: "post",
      indexes: [
        constraints.index([cols.createdAt, cols.id]),
        constraints.index([cols.categoryId]),
        constraints.index([cols.status, cols.scheduledFor]),
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

  return { models: { Admin, Session, LoginRateLimit, Category, Tag, Post, PostTag } };
});
