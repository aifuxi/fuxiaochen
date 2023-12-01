'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Flex, Text } from '@radix-ui/themes';

import { cn } from '@/utils';

export function NavLink({ el }: { el: { label: string; link: string } }) {
  const pathname = usePathname();

  return (
    <Flex key={el.link} py="6" asChild justify={'center'} align={'center'}>
      <Link
        href={el.link}
        className={cn(
          'cursor-pointer transition-all min-w-[64px]',
          pathname === el.link ? 'bg-gray-12' : '',
          'hover:bg-gray-12',
          pathname === el.link ? 'text-gray-1' : 'text-gray-11',
          'hover:text-gray-1',
        )}
      >
        <Text
          size={'4'}
          as="div"
          weight={'bold'}
          className="!tracking-[0.25em]"
          style={{ writingMode: 'vertical-lr' }}
        >
          {el.label}
        </Text>
      </Link>
    </Flex>
  );
}
