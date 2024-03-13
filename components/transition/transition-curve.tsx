'use client';

// 动画实现来自：https://www.youtube.com/watch?v=WmvpJ4KX30s
// 具体代码：https://github.com/olivierlarose/nextjs-framer-page-transition/blob/main/src/components/Layout/Curve/index.jsx
// 下面本代码基于上面的修改而来
import React, { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { type Variants, motion } from 'framer-motion';

import { PATHS_MAP } from '@/config';

import { type FCProps } from '@/types';

import { cn } from '@/lib/utils';

import {
  curveTextVariants,
  curveTranslateVariants,
  curveVariants,
} from './variants';

const anim = (variants: Variants) => {
  return {
    variants,
    initial: 'initial',
    animate: 'enter',
    exit: 'exit',
  };
};

export const TransitionCurve = ({ children }: FCProps) => {
  const pathname = usePathname();
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function resize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="">
      <div
        style={{ opacity: dimensions.width ? 1 : 0 }}
        className={cn(
          'bg-primary transition-opacity delay-100 ease-linear duration-0',
          'fixed w-screen pointer-events-none inset-x-0',
        )}
      />
      <motion.p
        className="text-5xl font-semibold absolute left-1/2 top-[40%] text-primary-foreground z-[101] text-center -translate-x-1/2"
        {...anim(curveTextVariants)}
      >
        {PATHS_MAP[pathname]}
      </motion.p>
      {dimensions.width > 0 && <CurveSVG {...dimensions} />}
      {children}
    </div>
  );
};

const CurveSVG = ({ height, width }: { height: number; width: number }) => {
  const initialPath = `
        M0 300 
        Q${width / 2} 0 ${width} 300
        L${width} ${height + 300}
        Q${width / 2} ${height + 600} 0 ${height + 300}
        L0 0
    `;

  const targetPath = `
        M0 300
        Q${width / 2} 0 ${width} 300
        L${width} ${height}
        Q${width / 2} ${height} 0 ${height}
        L0 0
    `;

  return (
    <motion.svg
      {...anim(curveTranslateVariants)}
      className={cn(
        'bg-background z-[100] fill-primary',
        'fixed h-[calc(100vh+600px)] pointer-events-none inset-x-0 w-screen',
      )}
    >
      <motion.path {...anim(curveVariants(initialPath, targetPath))} />
    </motion.svg>
  );
};
