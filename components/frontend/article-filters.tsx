"use client";

import { ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type Taxonomy = { id: string; name: string; count: number };
type Filters = { q: string; categoryId: string; tagId: string };

function filterHref(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.tagId) params.set("tagId", filters.tagId);
  // 所有条件操作都从第一页开始；翻页由独立分页链接负责。
  return params.size ? `/posts?${params}` : "/posts";
}

function FilterLink({
  href,
  label,
  selected,
  pending,
  navigate,
  className,
  children,
}: {
  href: string;
  label: string;
  selected?: boolean;
  pending: boolean;
  navigate: (href: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      render={
        <Link
          href={href}
          aria-label={label}
          scroll={false}
          onNavigate={(event) => {
            event.preventDefault();
            if (!pending) navigate(href);
          }}
        />
      }
      nativeButton={false}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Base UI render 输出真实链接，保留可刷新与新窗口导航。
      role="link"
      variant={selected ? "secondary" : "ghost"}
      size="compact"
      className={className}
      disabled={pending}
      aria-current={selected ? "true" : undefined}
    >
      {children}
    </Button>
  );
}

export function ArticleFilters({
  q,
  categoryId,
  tagId,
  categories,
  tags,
  totalCount,
  resultCount,
}: Filters & {
  categories: Taxonomy[];
  tags: Taxonomy[];
  totalCount: number;
  resultCount?: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState({ source: q, value: q });
  const query = search.source === q ? search.value : q;
  const [tagPanel, setTagPanel] = useState({ source: tagId, open: Boolean(tagId) });
  const tagsOpen = tagPanel.source === tagId ? tagPanel.open : Boolean(tagId) || tagPanel.open;
  const [pending, startTransition] = useTransition();
  const applied = { q, categoryId, tagId };
  const hasFilters = Boolean(q || categoryId || tagId);
  const category = categories.find((item) => item.id === categoryId);
  const tag = tags.find((item) => item.id === tagId);

  // 地址变化时同步已提交值；普通输入和标签展开仍是当前页面的本地状态。
  if (search.source !== q) setSearch({ source: q, value: q });
  if (tagPanel.source !== tagId) setTagPanel({ source: tagId, open: tagsOpen });

  const navigate = (href: string) => {
    startTransition(() => router.push(href, { scroll: false }));
  };
  const linkProps = { pending, navigate };

  return (
    <div className="site-article-tools" aria-busy={pending}>
      <section className="site-article-discovery" aria-label="查找文章">
        <search aria-label="搜索文章">
          <form
            action="/posts"
            method="get"
            onSubmit={(event) => {
              event.preventDefault();
              if (!pending) navigate(filterHref({ ...applied, q: query }));
            }}
          >
            <label className="site-search-label" htmlFor="post-search">
              搜索文章
            </label>
            {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
            {tagId && <input type="hidden" name="tagId" value={tagId} />}
            <InputGroup>
              <InputGroupInput
                type="search"
                id="post-search"
                name="q"
                maxLength={200}
                placeholder="搜索标题、正文、分类或标签"
                value={query}
                onChange={(event) => setSearch({ source: q, value: event.target.value })}
                disabled={pending}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" aria-label="提交搜索" disabled={pending}>
                  <Search size={18} aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </search>
        <nav className="site-post-categories" aria-label="按分类浏览">
          <FilterLink
            {...linkProps}
            href={filterHref({ ...applied, categoryId: "" })}
            label={`全部分类，${totalCount} 篇文章`}
            selected={!categoryId}
          >
            全部{" "}
            <span key="count" className="site-filter-count">
              {totalCount}
            </span>
          </FilterLink>
          {categories.map((item) => (
            <FilterLink
              {...linkProps}
              key={item.id}
              href={filterHref({ ...applied, categoryId: item.id })}
              label={`${item.name}，${item.count} 篇文章`}
              selected={categoryId === item.id}
            >
              {item.name}{" "}
              <span key="count" className="site-filter-count">
                {item.count}
              </span>
            </FilterLink>
          ))}
        </nav>
        {tags.length > 0 && (
          <div className="site-tags-disclosure">
            <Button
              variant="ghost"
              size="compact"
              className="site-tags-trigger"
              aria-expanded={tagsOpen}
              aria-controls="post-tags"
              disabled={pending}
              onClick={() => setTagPanel({ source: tagId, open: !tagsOpen })}
            >
              按标签浏览
              {tagId && <span className="site-filter-count">已选 1 项</span>}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={tagsOpen ? "is-open" : undefined}
              />
            </Button>
            <div id="post-tags" hidden={!tagsOpen}>
              <nav className="site-post-tags" aria-label="按标签浏览">
                {tags.map((item) => (
                  <FilterLink
                    {...linkProps}
                    key={item.id}
                    href={filterHref({ ...applied, tagId: tagId === item.id ? "" : item.id })}
                    label={`${tagId === item.id ? "移除" : "筛选"}标签 ${item.name}，${item.count} 篇文章`}
                    className="site-tag-choice"
                    selected={tagId === item.id}
                  >
                    #{item.name}{" "}
                    <span key="count" className="site-filter-count">
                      {item.count}
                    </span>
                  </FilterLink>
                ))}
              </nav>
            </div>
          </div>
        )}
      </section>
      <div className="site-post-results-heading">
        <output className="site-filter-status" aria-atomic="true">
          {pending
            ? "更新文章列表中"
            : resultCount === undefined
              ? "文章筛选参数无效"
              : hasFilters
                ? `找到 ${resultCount} 篇文章`
                : "全部文章"}
        </output>
        {hasFilters && (
          <FilterLink
            {...linkProps}
            href="/posts"
            label="清除全部筛选"
            className="site-clear-filter"
          >
            清除筛选
          </FilterLink>
        )}
      </div>
      {hasFilters && (
        <nav className="site-applied-filters" aria-label="已选条件">
          {q && (
            <FilterLink
              {...linkProps}
              href={filterHref({ ...applied, q: "" })}
              label={`移除关键词：${q}`}
              className="site-applied-filter"
            >
              搜索：{q} <X key="remove" size={13} aria-hidden="true" />
            </FilterLink>
          )}
          {categoryId && (
            <FilterLink
              {...linkProps}
              href={filterHref({ ...applied, categoryId: "" })}
              label={`移除分类：${category?.name ?? "已不可用的分类"}`}
              className="site-applied-filter"
            >
              {category?.name ?? "已不可用的分类"} <X key="remove" size={13} aria-hidden="true" />
            </FilterLink>
          )}
          {tagId && (
            <FilterLink
              {...linkProps}
              href={filterHref({ ...applied, tagId: "" })}
              label={`移除标签：${tag?.name ?? "已不可用的标签"}`}
              className="site-applied-filter"
            >
              #{tag?.name ?? "已不可用的标签"} <X key="remove" size={13} aria-hidden="true" />
            </FilterLink>
          )}
        </nav>
      )}
    </div>
  );
}
