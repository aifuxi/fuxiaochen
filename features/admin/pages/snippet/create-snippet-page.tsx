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

import { CreateSnippetForm } from '../../components';

export const CreateSnippetPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_HOME}>{PATHS_MAP[PATHS.ADMIN_HOME]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_SNIPPET}>
                {PATHS_MAP[PATHS.ADMIN_SNIPPET]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {PATHS_MAP[PATHS.ADMIN_SNIPPET_CREATE]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl md:text-5xl font-bold mb-2">
        {PATHS_MAP[PATHS.ADMIN_SNIPPET_CREATE]}
      </h2>
      <p className="text-lg text-muted-foreground">
        Talk is cheap. Show me the code.
        <span className="ml-8">—— Linus Torvalds</span>
      </p>

      <CreateSnippetForm />
    </div>
  );
};
