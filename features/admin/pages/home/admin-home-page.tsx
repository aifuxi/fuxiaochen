import React from 'react';

import { IllustrationConstruction } from '@/components/illustrations';
import { PageBreadcrumb } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminContentLayout } from '../../components';

export const AdminHomePage = () => {
  return (
    <AdminContentLayout
      breadcrumb={<PageBreadcrumb breadcrumbList={[PATHS.ADMIN_HOME]} />}
    >
      <div className="mt-[18vh] grid place-content-center">
        <IllustrationConstruction className="size-[320px]" />
        <h3 className="text-center text-2xl font-semibold tracking-tight">
          开发中
        </h3>
      </div>
    </AdminContentLayout>
  );
};
