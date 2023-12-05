import React from 'react';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}

        <Footer />
      </div>
    </main>
  );
}
