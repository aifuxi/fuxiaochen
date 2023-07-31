'use client';

import React from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { UMT_SOURCE } from '@/constants';

export default function BackToPreviousPage() {
  const searchParams = useSearchParams();
  const umtSource = searchParams.get(UMT_SOURCE);
  const link = umtSource ? umtSource : '/';

  return (
    <Link
      className="underline font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
      href={link}
    >
      <code>$ cd ..</code>
    </Link>
  );
}
