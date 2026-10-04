"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  const router = useRouter();
  const [search, setSearch] = useState({ source: q, value: q });
  const query = search.source === q ? search.value : q;
  const [category, setCategory] = useState(categoryId);
  const [tag, setTag] = useState(tagId);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const filterCount = Number(Boolean(categoryId)) + Number(Boolean(tagId));

  // 查询改变时重置输入，保持组件实例以保留弹窗触发器焦点。
  if (search.source !== q) setSearch({ source: q, value: q });

  const navigate = (nextCategory: string, nextTag: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (nextCategory) params.set("categoryId", nextCategory);
    if (nextTag) params.set("tagId", nextTag);
    startTransition(() => {
      router.push(params.size ? `/posts?${params}` : "/posts", { scroll: false });
    });
  };

  return (
    <div className="site-article-tools" aria-busy={pending}>
      <div className="site-filters">
        <search aria-label="搜索文章">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!pending) navigate(categoryId, tagId);
            }}
          >
            <label className="sr-only" htmlFor="post-search">
              搜索文章
            </label>
            <InputGroup>
              <InputGroupInput
                type="search"
                id="post-search"
                maxLength={200}
                placeholder="搜索文章、分类或标签"
                value={query}
                onChange={(event) => setSearch({ source: q, value: event.target.value })}
                disabled={pending}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" aria-label="搜索文章" disabled={pending}>
                  <Search size={16} aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </search>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setCategory(categoryId);
              setTag(tagId);
            }
            setOpen(nextOpen);
          }}
        >
          <DialogTrigger render={<Button variant="ghost" disabled={pending} />}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            筛选{filterCount > 0 ? ` (${filterCount})` : ""}
          </DialogTrigger>
          <DialogContent className="site-filter-dialog">
            <DialogTitle className="site-filter-title">筛选文章</DialogTitle>
            <DialogDescription className="site-filter-description">
              分类与标签可组合筛选。
            </DialogDescription>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (pending) return;
                setOpen(false);
                navigate(category, tag);
              }}
            >
              <div className="site-filter-fields">
                <div className="site-filter-field">
                  <label htmlFor="post-category">分类</label>
                  <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                    <SelectTrigger id="post-category">
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
                </div>
                <div className="site-filter-field">
                  <label htmlFor="post-tag">标签</label>
                  <Select value={tag} onValueChange={(value) => setTag(value ?? "")}>
                    <SelectTrigger id="post-tag">
                      <SelectValue>
                        {tags.find((t) => t.id === tag)?.name ??
                          (tag ? "标签已不可用" : "全部标签")}
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
                </div>
              </div>
              <div className="site-filter-actions">
                <DialogClose render={<Button variant="secondary" />}>取消</DialogClose>
                <Button type="submit" variant="primary" disabled={pending}>
                  应用筛选
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <output className="sr-only">{pending ? "更新文章列表中" : ""}</output>
    </div>
  );
}
