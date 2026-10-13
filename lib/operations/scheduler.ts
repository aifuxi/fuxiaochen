import "server-only";
import { and, asc, eq, lte } from "drizzle-orm";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";
import {
  notification,
  operationSetting as operationSettingTable,
  post as postTable,
} from "@/lib/database/schema";
import { postContentSchema } from "@/lib/posts/document";
import { slugSchema, postDisplayTitle } from "@/lib/posts/schema";

import { createBackup, newBackupId } from "./backups";
import { operationSetting } from "./settings";

export async function publishDuePosts(actor?: TaxonomyActor) {
  return writeTransaction((tx) => {
    if (actor) authorizeAdmin(actor, tx);
    const now = new Date();
    const due = tx
      .select()
      .from(postTable)
      .where(and(eq(postTable.status, "scheduled"), lte(postTable.scheduledFor, now)))
      .orderBy(asc(postTable.scheduledFor), asc(postTable.id))
      .limit(100)
      .all();
    let published = 0;
    let skipped = 0;
    for (const post of due) {
      if (
        !post.title.trim() ||
        !post.categoryId ||
        !slugSchema.safeParse(post.slug).success ||
        !postContentSchema.safeParse(post.content).success ||
        post.version >= Number.MAX_SAFE_INTEGER - 1
      ) {
        skipped++;
        tx.insert(notification)
          .values({
            id: `schedule-error:${post.id}:${post.version}`,
            kind: "schedule-error",
            sourceId: post.id,
            title: `排期未发布：${postDisplayTitle(post.title)}，请检查标题、链接、分类、正文与版本`,
            href: `/admin/posts/${post.id}/edit`,
            createdAt: now,
            resolvedAt: null,
          })
          .onConflictDoNothing()
          .run();
        continue;
      }
      if (
        !tx
          .update(postTable)
          .set({
            status: "published",
            scheduledFor: null,
            publishedAt: post.publishedAt ?? now,
            slugLockedAt: post.slugLockedAt ?? now,
            updatedAt: now,
            version: post.version + 1,
          })
          .where(
            and(
              eq(postTable.id, post.id),
              eq(postTable.status, "scheduled"),
              eq(postTable.version, post.version),
            ),
          )
          .run().changes
      )
        continue;
      published++;
      tx.insert(notification)
        .values({
          id: `published:${post.id}:${post.version}`,
          kind: "published",
          sourceId: post.id,
          title: `排期已发布：${post.title}`,
          href: `/admin/posts/${post.id}/edit`,
          createdAt: now,
          resolvedAt: null,
        })
        .run();
    }
    return { published, skipped, processedAt: now.toISOString() };
  });
}
export async function runScheduledOperations() {
  const publication = await publishDuePosts();
  const setting = writeTransaction((tx) => {
    operationSetting(tx);
    tx.update(operationSettingTable)
      .set({ schedulerLastRunAt: new Date() })
      .where(eq(operationSettingTable.id, 1))
      .run();
    return operationSetting(tx);
  });
  const date = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
  const backup = setting.autoBackup ? await createBackup(newBackupId(), undefined, date) : null;
  return { publication, backup };
}
