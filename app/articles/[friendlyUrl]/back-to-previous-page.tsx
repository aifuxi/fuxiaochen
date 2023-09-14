'use client';

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BackToPreviousPage() {
  const router = useRouter();

  return (
    <Link
      className="underline font-semibold"
      href={'#'}
      onClick={(e) => {
        e.preventDefault();
        router.back();
      }}
    >
      <code>$ cd ..</code>
    </Link>
  );
}
