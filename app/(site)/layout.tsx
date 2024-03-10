import { type FCProps } from '@/types';

import { Navbar } from '@/components/navbar';

export default function Layout({ children }: FCProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
