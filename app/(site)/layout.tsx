import { type FCProps } from '@/types';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Layout({ children }: FCProps) {
  return (
    <div className="flex flex-col gap-20">
      <Navbar />
      <div className="flex-1 flex flex-col items-center">{children}</div>
      <Footer />
    </div>
  );
}
