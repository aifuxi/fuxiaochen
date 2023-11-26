'use client';

import React from 'react';

import { useMount } from 'ahooks';
import { MoonStar, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

export function ToggleTheme({ className }: { className?: string }) {
  useMount(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.getItem('color-theme') === 'dark' ??
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
    <Button size={'icon'} className={cn(className)} onClick={handleChangeTheme}>
      <Sun className="hidden dark:block" />
      <MoonStar className="dark:hidden" />
    </Button>
  );
}
