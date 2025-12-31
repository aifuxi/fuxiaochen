import * as React from "react";

import { type Metadata } from "next";

import { isNil } from "es-toolkit";

import { getCategoryDetail } from "@/api/category";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const resp = await getCategoryDetail(params.slug);
  const category = resp.data;

  if (isNil(category)) {
    return {};
  }

  return {
    title: `${category.name}`,
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
