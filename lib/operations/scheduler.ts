import "server-only";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { postContentSchema } from "@/lib/posts/document";
import { writeTransaction } from "@/prisma/db";

import { createBackup, newBackupId } from "./backups";
import { operationSetting } from "./settings";

export async function publishDuePosts(actor?: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    if (actor) await authorizeAdmin(actor);
    const now = new Date();
    const due = await tx.orm.Post.where({ status: "scheduled" })
      .where((p) => p.scheduledFor.lte(now))
      .orderBy([(p) => p.scheduledFor.asc(), (p) => p.id.asc()])
      .limit(100)
      .all();
    let published = 0;
    let skipped = 0;
    for (const post of due) {
      if (
        !postContentSchema.safeParse(post.content).success ||
        post.version >= Number.MAX_SAFE_INTEGER - 1
      ) {
        skipped++;
        const id = `schedule-error:${post.id}:${post.version}`;
        if (!(await tx.orm.Notification.where({ id }).first()))
          await tx.orm.Notification.create({
            id,
            kind: "schedule-error",
            sourceId: post.id,
            title: `排期未发布：${post.title}，请检查正文与版本`,
            href: `/admin/posts/${post.id}/edit`,
            createdAt: now,
            resolvedAt: null,
          });
        continue;
      }
      if (
        !(await tx.orm.Post.where({
          id: post.id,
          status: "scheduled",
          version: post.version,
        }).updateAndCount({
          status: "published",
          scheduledFor: null,
          publishedAt: post.publishedAt ?? now,
          slugLockedAt: post.slugLockedAt ?? now,
          updatedAt: now,
          version: post.version + 1,
        }))
      )
        continue;
      published++;
      await tx.orm.Notification.create({
        id: `published:${post.id}:${post.version}`,
        kind: "published",
        sourceId: post.id,
        title: `排期已发布：${post.title}`,
        href: `/admin/posts/${post.id}/edit`,
        createdAt: now,
        resolvedAt: null,
      });
    }
    return { published, skipped, processedAt: now.toISOString() };
  });
}
export async function runScheduledOperations() {
  const publication = await publishDuePosts();
  const setting = await writeTransaction(async (tx) => {
    await operationSetting(tx);
    await tx.orm.OperationSetting.where({ id: 1 }).updateAndCount({
      schedulerLastRunAt: new Date(),
    });
    return operationSetting(tx);
  });
  const date = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
  const backup = setting.autoBackup ? await createBackup(newBackupId(), undefined, date) : null;
  return { publication, backup };
}
