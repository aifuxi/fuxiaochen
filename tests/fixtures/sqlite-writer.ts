import { eq } from "drizzle-orm";

import { closeDatabase, writeTransaction } from "../../lib/database";
import { loginRateLimit } from "../../lib/database/schema";

// 由测试启动的独立进程，与另一个进程同时写同一临时 SQLite 文件。
process.env.DATABASE_PATH = process.argv[2];
try {
  for (let iteration = 0; iteration < 40; iteration++) {
    writeTransaction((tx) => {
      const current = tx.select().from(loginRateLimit).where(eq(loginRateLimit.id, 991)).get()!;
      tx.update(loginRateLimit)
        .set({ count: current.count + 1 })
        .where(eq(loginRateLimit.id, 991))
        .run();
    });
  }
} finally {
  closeDatabase();
}
