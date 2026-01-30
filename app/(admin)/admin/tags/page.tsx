import { getTagsAction } from "@/app/actions/tag";

import TagManagementPage from "./tag-list";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    name?: string;
    slug?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const { data } = await getTagsAction({
    page,
    pageSize,
    name: params.name,
    slug: params.slug,
    sortBy: params.sortBy,
    order: params.order,
  });

  return (
    <TagManagementPage
      initialData={{
        lists: data?.lists || [],
        total: data?.total || 0,
      }}
    />
  );
}
