import { notFound } from "next/navigation";

import { isNil } from "lodash-es";

import { SnippetDetailPage, getSnippetBySlug } from "@/features/snippet";
import { getSnippetUV } from "@/features/statistics";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const { snippet } = await getSnippetBySlug(params.slug);
  const uv = await getSnippetUV(snippet?.id);

  if (isNil(snippet)) {
    return notFound();
  }

  return <SnippetDetailPage snippet={snippet} uv={uv} />;
}
