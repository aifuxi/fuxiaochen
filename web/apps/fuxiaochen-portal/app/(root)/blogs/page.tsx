import { BlogGrid } from "@/components/blog/blog-grid";

import { getBlogList } from "@/api/blog";

export default async function Page() {
  const resp = await getBlogList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [] } = resp;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">博客</h1>
        <p className="text-lg text-muted-foreground">
          踩坑和学习记录，沉淀可借鉴的经验
        </p>
      </div>
      <BlogGrid blogs={lists} />
    </div>
  );
}
