import React from "react";

import { type Metadata } from "next";

import { isNil } from "lodash-es";

import { WEBSITE } from "@/constants";
import { getPublishedBlogBySlug } from "@/features/blog";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { blog } = await getPublishedBlogBySlug(params.slug);

  if (isNil(blog)) {
    return {};
  }

  return {
    title: `${blog.title} - ${WEBSITE}`,
    description: blog.description,
    keywords: blog.tags.map((el) => el.name).join(","),
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
