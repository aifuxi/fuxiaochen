import { type meilisearchClient } from "@/lib/meilisearch";

export type SortOrder = "asc" | "desc";

export type MultiSearchQuery = NonNullable<
  Parameters<typeof meilisearchClient.multiSearch>["0"]
>["queries"][number];
