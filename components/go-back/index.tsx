'use client';

import { useRouter } from 'next/navigation';

import { Button } from '../ui/button';

export function GoBack() {
  const router = useRouter();

  return (
    <Button
      variant="link"
      size={'lg'}
      className="text-2xl !pl-0"
      onClick={() => router.back()}
    >
      $ cd ..
      <span className="ml-1 text-muted-foreground animate-blinking">_</span>
    </Button>
  );
}
