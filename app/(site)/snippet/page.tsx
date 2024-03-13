import Link from 'next/link';

import { PATHS, PATHS_MAP } from '@/config';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { SnippetList, getSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getSnippets();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md 2xl:max-w-6xl md:px-0 md:mx-auto pb-24 pt-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.SITE_HOME}>{PATHS_MAP[PATHS.SITE_HOME]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[PATHS.SITE_SNIPPET]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        {PATHS_MAP[PATHS.SITE_SNIPPET]}
      </h2>
      <p className="text-lg text-muted-foreground mb-9">
        多是一些零零碎碎的片段，通常是代码片段
      </p>

      <SnippetList snippets={snippets} />
    </div>
  );
}
