import React from 'react';

import { type Metadata } from 'next';

import { isNil } from 'lodash-es';

import { WEBSITE } from '@/config';

import { getSnippetBySlug } from '@/features/snippet';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { snippet } = await getSnippetBySlug(params.slug);

  if (isNil(snippet)) {
    return {};
  }

  return {
    title: `${snippet.title} - ${WEBSITE}`,
    description: snippet.description,
    keywords: snippet.tags.map((el) => el.name).join(','),
  };
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
