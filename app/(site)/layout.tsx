import { type FCProps } from '@/types';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Layout({ children }: FCProps) {
  return (
    <div className="grid grid-cols-1 gap-20">
      <Navbar />
      <div className="flex flex-col items-center min-h-[calc(100vh-160px-220px)]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
