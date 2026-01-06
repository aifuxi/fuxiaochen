import * as React from "react";

import { type Metadata } from "next";

import { isNil } from "es-toolkit";

import { getBlogDetail } from "@/api/blog";
import { WEBSITE } from "@/constants";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const resp = await getBlogDetail(params.slug);
  const blog = resp;

  if (isNil(blog)) {
    return {};
  }

  return {
    title: `${blog.title} - ${WEBSITE}`,
    description: blog.description,
    keywords: blog?.tags?.map((el) => el.name).join(","),
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
