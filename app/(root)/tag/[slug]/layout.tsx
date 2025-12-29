import * as React from "react";

import { type Metadata } from "next";

import { isNil } from "es-toolkit";

import { getTagDetail } from "@/api/tag";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const resp = await getTagDetail(params.slug);
  const tag = resp.data;

  if (isNil(tag)) {
    return {};
  }

  return {
    title: `${tag.name}`,
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
