import { Suspense } from "react";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogList } from "@/components/blog/blog-list";
import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
import { Loader2 } from "lucide-react";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }>;
}

const DEFAULT_PAGE_SIZE = 10;

async function BlogListContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || String(DEFAULT_PAGE_SIZE), 10);

  // 并行获取数据
  const [blogsResult, categoriesResult, tagsResult] = await Promise.all([
    getBlogsAction({
      page,
      pageSize,
      title: params.title,
      categoryId: params.categoryId,
      tagId: params.tagId,
      sortBy: params.sortBy || "createdAt",
      order: params.order || "desc",
      published: true,
    }),
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  if (!blogsResult.success || !categoriesResult.success || !tagsResult.success) {
    throw new Error("获取数据失败");
  }

  if (!blogsResult.data) {
    throw new Error("获取博客数据失败");
  }

  const blogs = blogsResult.data;
  const categories = categoriesResult.data?.lists || [];
  const tags = tagsResult.data?.lists || [];

  // 构建基础 URL 用于分页
  const baseUrl = `/blog?title=${params.title || ""}&categoryId=${params.categoryId || ""}&tagId=${params.tagId || ""}&sortBy=${params.sortBy || "createdAt"}&order=${params.order || "desc"}`;

  return (
    <div className="space-y-6">
      <BlogFilterBar
        categories={categories}
        tags={tags}
        currentFilters={{
          title: params.title,
          categoryId: params.categoryId,
          tagId: params.tagId,
          sortBy: params.sortBy || "createdAt",
          order: params.order || "desc",
        }}
      />
      <BlogList
        blogs={blogs.lists || []}
        total={blogs.total}
        currentPage={page}
        pageSize={pageSize}
        baseUrl={baseUrl}
      />
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <Title level={1}>博客</Title>
        <Text type="secondary" className="mt-2">
          探索技术文章与学习笔记
        </Text>
      </div>

      {/* 内容区 */}
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
          </div>
        }
      >
        <BlogListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
