import * as React from "react";

import { type Metadata } from "next";

import { isNil } from "es-toolkit";

import { WEBSITE } from "@/constants";
import { getSnippetBySlug } from "@/features/snippet";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { snippet } = await getSnippetBySlug(params.slug);

  if (isNil(snippet)) {
    return {};
  }

  return {
    title: `${snippet.title} - ${WEBSITE}`,
    description: snippet.description,
    keywords: snippet.tags.map((el) => el.name).join(","),
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
