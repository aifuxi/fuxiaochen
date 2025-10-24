import * as React from "react";

import { type Metadata } from "next";

import { isNil } from "es-toolkit";

import { getTagBySlug } from "../actions";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { tag } = await getTagBySlug(params.slug);

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
