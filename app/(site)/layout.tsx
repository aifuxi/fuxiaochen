import { type FCProps } from '@/types';

import { Navbar } from '@/components/navbar';

export default function Layout({ children }: FCProps) {
  return (
    <>
      {typeof window !== 'undefined' && <Navbar />}
      <main>{children}</main>
    </>
  );
}
