'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { LIST_CONTAINER_VARIANTS, LIST_ITEM_VARIANTS } from '@/config';

import { IllustrationNoContent } from '@/components/illustrations';

import { SnippetListItem } from './snippet-list-item';

import { type Snippet } from '../types';

type SnippetListProps = {
  snippets: Snippet[];
};

export const SnippetList = ({ snippets }: SnippetListProps) => {
  if (!snippets.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          暂无 Snippet
        </h3>
      </div>
    );
  }

  return (
    <motion.ul
      className="grid gap-4"
      variants={LIST_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {snippets.map((el) => (
        <motion.li key={el.id} variants={LIST_ITEM_VARIANTS}>
          <SnippetListItem snippet={el} />
        </motion.li>
      ))}
    </motion.ul>
  );
};
