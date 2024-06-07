import React from "react";

import Link from "next/link";

import { useRequest } from "ahooks";
import { LoaderCircle, Search } from "lucide-react";

import { type MultiSearchQuery } from "@/types";

import {
  MEILISEARCH_INDEX_BLOGS,
  MEILISEARCH_INDEX_SNIPPETS,
  PATHS,
} from "@/constants";
import { type Blog } from "@/features/blog";
import { meilisearchClient } from "@/lib/meilisearch";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

export const SearchIcon = () => {
  const commonQuery: MultiSearchQuery = {
    attributesToRetrieve: ["title", "description", "body"],
    attributesToCrop: ["title", "description", "body", "slug"],
    attributesToHighlight: ["title", "description", "body"],
    attributesToSearchOn: ["title", "description", "body"],
    cropLength: 10,
    cropMarker: "...",
    indexUid: "",
    limit: 5,
  };

  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const {
    data: resp,
    runAsync,
    loading,
  } = useRequest(
    () =>
      meilisearchClient.multiSearch({
        queries: [
          {
            ...commonQuery,
            q,
            indexUid: MEILISEARCH_INDEX_BLOGS,
          },
          {
            ...commonQuery,
            q,
            indexUid: MEILISEARCH_INDEX_SNIPPETS,
          },
        ],
      }),
    {
      manual: true,
      refreshDeps: [q],
      loadingDelay: 300,
    },
  );

  const data = React.useMemo(() => {
    const blogs = resp?.results?.find((el) => el.indexUid === "blogs");
    const snippets = resp?.results?.find((el) => el.indexUid === "snippets");

    const formateBlogs = blogs?.hits.map(
      (blog) => blog._formatted as unknown as Blog,
    );
    const formateSnippets = snippets?.hits.map(
      (blog) => blog._formatted as unknown as Blog,
    );

    return {
      formateBlogs: formateBlogs,
      formateSnippets: formateSnippets,
      total: (formateBlogs?.length ?? 0) + (formateSnippets?.length ?? 0),
    };
  }, [resp]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} size={"icon"} variant={"outline"}>
          <Search className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>搜索</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-3">
          <Input
            prefix="搜索"
            value={q}
            type="search"
            className="flex-1"
            placeholder="请输入要搜索的内容"
            onChange={(v) => {
              setQ(v.target.value);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await runAsync();
              }
            }}
          />
          <Button
            onClick={async () => {
              await runAsync();
            }}
            size={"icon"}
          >
            <Search className="size-4" />
          </Button>
        </div>

        {!loading && (
          <div className="mt-4 text-sm text-muted-foreground">
            找到
            <span className="mx-1 text-base font-semibold text-primary">
              {data?.total}
            </span>
            个结果
          </div>
        )}

        {loading ? (
          <LoaderCircle className="mr-2 size-14 animate-spin" />
        ) : (
          <ScrollArea className="max-h-[50vh]">
            <ul className="flex flex-col space-y-4">
              {data?.formateBlogs?.map((blog) => (
                <li key={blog.id} onClick={() => setOpen(false)}>
                  <Link
                    href={`${PATHS.SITE_BLOG}/${blog.slug}`}
                    className="flex flex-col space-y-2 border-b pb-4"
                  >
                    <div
                      className="search-result__item line-clamp-1 text-base font-medium"
                      dangerouslySetInnerHTML={{ __html: blog.title }}
                    ></div>
                    <div
                      className="search-result__item line-clamp-1 text-sm text-muted-foreground "
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    ></div>
                    <div
                      className="search-result__item line-clamp-2 text-sm"
                      dangerouslySetInnerHTML={{ __html: blog.body }}
                    ></div>
                  </Link>
                </li>
              ))}
              {data?.formateSnippets?.map((snippet) => (
                <li key={snippet.id} onClick={() => setOpen(false)}>
                  <Link
                    href={`${PATHS.SITE_SNIPPET}/${snippet.slug}`}
                    className="flex flex-col space-y-2 border-b pb-4"
                  >
                    <div
                      className="search-result__item line-clamp-1 text-base font-medium"
                      dangerouslySetInnerHTML={{ __html: snippet.title }}
                    ></div>
                    <div
                      className="search-result__item line-clamp-1 text-sm text-muted-foreground "
                      dangerouslySetInnerHTML={{
                        __html: snippet.description,
                      }}
                    ></div>
                    <div
                      className="search-result__item line-clamp-2 text-sm"
                      dangerouslySetInnerHTML={{ __html: snippet.body }}
                    ></div>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
