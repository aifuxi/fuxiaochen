"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
export function ArticleFilters({
  q,
  categoryId,
  tagId,
  categories,
  tags,
}: {
  q: string;
  categoryId: string;
  tagId: string;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}) {
  const [category, setCategory] = useState(categoryId);
  const [tag, setTag] = useState(tagId);
  return (
    <form action="/posts" className="site-filters" aria-label="文章筛选">
      <label className="site-search" htmlFor="post-search">
        <span className="sr-only">搜索文章</span>
        <Input
          type="search"
          id="post-search"
          name="q"
          maxLength={200}
          placeholder="搜索文章、分类或标签"
          defaultValue={q}
        />
      </label>
      <Select
        name="categoryId"
        value={category}
        onValueChange={(value) => setCategory(value ?? "")}
      >
        <SelectTrigger aria-label="分类">
          <SelectValue>
            {categories.find((c) => c.id === category)?.name ??
              (category ? "分类已不可用" : "全部分类")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部分类</SelectItem>
          {categories.map((c) => (
            <SelectItem value={c.id} key={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="tagId" value={tag} onValueChange={(value) => setTag(value ?? "")}>
        <SelectTrigger aria-label="标签">
          <SelectValue>
            {tags.find((t) => t.id === tag)?.name ?? (tag ? "标签已不可用" : "全部标签")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部标签</SelectItem>
          {tags.map((t) => (
            <SelectItem value={t.id} key={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="secondary">
        筛选
      </Button>
    </form>
  );
}
