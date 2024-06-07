import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  MEILISEARCH_INDEX_BLOGS,
  MEILISEARCH_INDEX_SNIPPETS,
} from "@/constants";
import { getPublishedBlogs } from "@/features/blog";
import { getPublishedSnippets } from "@/features/snippet";
import { meilisearchClient } from "@/lib/meilisearch";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SettingsModal = ({ open, setOpen }: Props) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-4">
          <Button onClick={() => handleInitMeiliSearchIndex()}>
            初始化 MeiliSearch Index
          </Button>

          <Button onClick={() => handleInitMeiliSearchDocument()}>
            初始化 MeiliSearch Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  async function handleInitMeiliSearchIndex() {
    // 获取现有的索引
    const indexes = await meilisearchClient.getIndexes();

    const hasBlogIndex = indexes.results.find(
      (el) => el.uid === MEILISEARCH_INDEX_BLOGS,
    );
    const hasSnippetIndex = indexes.results.find(
      (el) => el.uid === MEILISEARCH_INDEX_SNIPPETS,
    );

    if (!hasBlogIndex) {
      await meilisearchClient.createIndex(MEILISEARCH_INDEX_BLOGS);
    }

    if (!hasSnippetIndex) {
      await meilisearchClient.createIndex(MEILISEARCH_INDEX_SNIPPETS);
    }
  }

  async function handleInitMeiliSearchDocument() {
    const { blogs } = await getPublishedBlogs();
    const { snippets } = await getPublishedSnippets();

    await meilisearchClient.index(MEILISEARCH_INDEX_BLOGS).addDocuments(blogs);

    await meilisearchClient
      .index(MEILISEARCH_INDEX_SNIPPETS)
      .addDocuments(snippets);
  }
};
