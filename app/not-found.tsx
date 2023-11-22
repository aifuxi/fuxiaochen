import { type Metadata } from 'next';

import { EmptyPage } from '@/components/client';
import { NotFound404Illustration } from '@/components/rsc';

export const metadata: Metadata = {
  title: '404 Not Found',
};

const NotFoundPage = () => {
  return (
    <>
      <EmptyPage
        illustration={
          <NotFound404Illustration className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px]" />
        }
        title="啊噢，页面不见啦~"
      />
    </>
  );
};

export default NotFoundPage;
