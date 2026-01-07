import { useSearchParams } from "react-router-dom";

import ContentLayout from "@/components/content-layout";

import { ROUTES } from "@/constants/route";
import BlogCreateForm from "@/features/blog/components/blog-create-form";

export default function BlogCreate() {
  // 从 query中取出id字段
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  const title = id ? "编辑博客" : "新建博客";

  return (
    <ContentLayout
      title={title}
      routes={[
        {
          href: ROUTES.Home.href,
          name: ROUTES.Home.name,
        },
        {
          href: ROUTES.BlogList.href,
          name: ROUTES.BlogList.name,
        },
        id
          ? {
              name: id,
            }
          : {
              href: ROUTES.BlogCreate.href,
              name: ROUTES.BlogCreate.name,
            },
      ]}
    >
      <BlogCreateForm id={id} />
    </ContentLayout>
  );
}
