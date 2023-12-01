import React from 'react';

import { Flex } from '@radix-ui/themes';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flex asChild>
      <main>
        <Navbar />
        <Flex
          grow={'1'}
          direction={'column'}
          className="h-screen overflow-scroll"
        >
          {children}

          <Footer />
        </Flex>
      </main>
    </Flex>
  );
}
