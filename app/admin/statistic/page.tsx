import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

import { AdminStatisticPage } from '@/features/admin';
import { getAdminPageTitle } from '@/utils';

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.ADMIN_STATISTIC]),
};

export default function Page() {
  return <AdminStatisticPage />;
}
