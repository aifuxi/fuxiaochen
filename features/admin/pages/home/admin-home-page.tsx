import React from 'react';

import { IllustrationConstruction } from '@/components/illustrations';
import { PageHeader } from '@/components/page-header';

import { PATHS } from '@/constants';

export const AdminHomePage = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader breadcrumbList={[PATHS.ADMIN_HOME]} />

      <div className="grid place-content-center mt-[18vh]">
        <IllustrationConstruction className="w-[320px] h-[320px]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          开发中
        </h3>
      </div>
    </div>
  );
};
