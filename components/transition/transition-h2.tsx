'use client';

import React from 'react';

import { type HTMLMotionProps, motion } from 'framer-motion';

export const TransitionH2 = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLHeadingElement> & HTMLMotionProps<'h2'>) => {
  return (
    <motion.h2
      {...props}
      className={className}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 1.3, type: 'ease' } }}
    >
      {children}
    </motion.h2>
  );
};
