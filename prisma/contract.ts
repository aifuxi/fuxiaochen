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

  return { models: { Admin, Session, LoginRateLimit } };
});
