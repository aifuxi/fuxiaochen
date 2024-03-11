import { type Metadata } from 'next';

import { isNil } from 'lodash-es';

import { WEBSITE } from '@/config';

import { type FCProps } from '@/types';

import { getPlublishedSnippetBySlug } from '@/features/snippet';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { snippet } = await getPlublishedSnippetBySlug(params.slug);

  if (isNil(snippet)) {
    return {};
  }

  return {
    title: `${snippet.title} · ${WEBSITE}`,
    description: snippet.description,
    keywords: snippet.tags.map((el) => el.name).join(','),
  };
}

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
