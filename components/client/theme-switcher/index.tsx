'use client';

import React from 'react';

import { useMount } from 'ahooks';
import { MoonStar, Sun } from 'lucide-react';

import { cn } from '@/utils';

export default function ThemeSwitcher({ className }: { className?: string }) {
  useMount(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  const handleChangeTheme = () => {
    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
      if (localStorage.getItem('color-theme') === 'light') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      }

      // if NOT set via local storage previously
    } else {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      }
    }
  };

  return (
    <div className={cn('cursor-pointer', className)}>
      <Sun
        size={24}
        className="hidden dark:block text-white"
        onClick={handleChangeTheme}
      />
      <MoonStar size={24} className="dark:hidden" onClick={handleChangeTheme} />
    </div>
  );
}
