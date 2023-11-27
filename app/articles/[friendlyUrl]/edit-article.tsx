'use client';

import React from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { Pencil1Icon } from '@radix-ui/react-icons';

export default function EditArticle({ articleId }: { articleId: string }) {
  const { data: session, status } = useSession();

  if (status === 'authenticated' && session) {
    return (
      <Link
        className="ml-4 flex items-center font-semibold text-primary/50 hover:text-primary transition-colors"
        href={`/admin/create-article?id=${articleId}`}
      >
        <span className="mr-1">编辑</span>
        <Pencil1Icon />
      </Link>
    );
  }
  return null;
}
