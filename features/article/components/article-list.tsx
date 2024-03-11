'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { LIST_CONTAINER_VARIANTS, LIST_ITEM_VARIANTS } from '@/config';

import { IllustrationNoContent } from '@/components/illustrations';

import { ArticleListItem } from './article-list-item';

import { type Article } from '../types';

type ArticleListProps = {
  articles: Article[];
};

export const ArticleList = ({ articles }: ArticleListProps) => {
  if (!articles.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          暂无文章
        </h3>
      </div>
    );
  }

  return (
    <motion.ul
      className="grid grid-cols-1 2xl:grid-cols-2 gap-4"
      variants={LIST_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {articles.map((el) => (
        <motion.li key={el.id} variants={LIST_ITEM_VARIANTS}>
          <ArticleListItem article={el} />
        </motion.li>
      ))}
    </motion.ul>
  );
};
