import { type FCProps } from '@/types';

import { Navbar } from '@/components/navbar';
import { PageTransition } from '@/components/transition';

export default function Layout({ children }: FCProps) {
  return (
    <>
      <Navbar />
      <main>
        <PageTransition>{children}</PageTransition>;
      </main>
    </>
  );
}
