import { notFound } from "next/navigation";

import { isNil } from "lodash-es";

import { SnippetDetailPage, getSnippetBySlug } from "@/features/snippet";

export const revalidate = 60;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { snippet } = await getSnippetBySlug(params.slug);

  if (isNil(snippet)) {
    return notFound();
  }

  return <SnippetDetailPage snippet={snippet} />;
}
