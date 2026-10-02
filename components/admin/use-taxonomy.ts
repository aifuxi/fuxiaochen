"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Category, CategoryInput, Tag, TagInput } from "@/lib/taxonomy/schema";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "请求失败，请稍后重试。");
  return body.data;
}
const sortItems = <T extends Tag>(items: T[]) =>
  items.toSorted((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));

export function useTaxonomy() {
  const [categoryItems, setCategories] = useState<Category[]>([]);
  const [tagItems, setTags] = useState<Tag[]>([]);
  const [taxonomyLoading, setLoading] = useState(true);
  const [taxonomyError, setError] = useState("");
  const [taxonomyPending, setPending] = useState(false);
  const pending = useRef(false);
  const refreshAfterMutation = useRef(false);
  const mounted = useRef(false);
  const loadController = useRef<AbortController | null>(null);

  const reloadTaxonomy = useCallback(async () => {
    if (pending.current) {
      refreshAfterMutation.current = true;
      return;
    }
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    try {
      const [categories, tags] = await Promise.all([
        request<Category[]>("categories", { signal: controller.signal }),
        request<Tag[]>("tags", { signal: controller.signal }),
      ]);
      if (mounted.current && !controller.signal.aborted) {
        setCategories(categories);
        setTags(tags);
        setError("");
      }
    } catch (error) {
      if (mounted.current && !controller.signal.aborted)
        setError(error instanceof Error ? error.message : "分类与标签加载失败。");
    } finally {
      if (mounted.current && !controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => {
      if (mounted.current) void reloadTaxonomy();
    });
    return () => {
      mounted.current = false;
      loadController.current?.abort();
    };
  }, [reloadTaxonomy]);

  async function mutate<T>(work: () => Promise<T>) {
    if (pending.current || taxonomyLoading || taxonomyError)
      throw new Error("请等待分类与标签加载完成后重试。");
    pending.current = true;
    setPending(true);
    try {
      return await work();
    } finally {
      pending.current = false;
      if (mounted.current) {
        setPending(false);
        if (refreshAfterMutation.current) {
          refreshAfterMutation.current = false;
          void reloadTaxonomy();
        }
      }
    }
  }
  const createCategory = (input: CategoryInput) =>
    mutate(async () => {
      const item = await request<Category>("categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (mounted.current) setCategories((items) => sortItems([...items, item]));
      return item;
    });
  const createTag = (input: TagInput) =>
    mutate(async () => {
      const item = await request<Tag>("tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (mounted.current) setTags((items) => sortItems([...items, item]));
      return item;
    });
  const deleteCategory = (id: string) =>
    mutate(async () => {
      await request<{ id: string }>(`categories/${id}`, { method: "DELETE" });
      if (mounted.current) setCategories((items) => items.filter((item) => item.id !== id));
    });
  const deleteTag = (id: string) =>
    mutate(async () => {
      await request<{ id: string }>(`tags/${id}`, { method: "DELETE" });
      if (mounted.current) setTags((items) => items.filter((item) => item.id !== id));
    });
  const retry = () => {
    if (pending.current) {
      refreshAfterMutation.current = true;
      return Promise.resolve();
    }
    setLoading(true);
    setError("");
    return reloadTaxonomy();
  };
  return {
    categoryItems,
    tagItems,
    taxonomyLoading,
    taxonomyError,
    taxonomyPending,
    reloadTaxonomy: retry,
    createCategory,
    createTag,
    deleteCategory,
    deleteTag,
  };
}
export type TaxonomyState = ReturnType<typeof useTaxonomy>;
