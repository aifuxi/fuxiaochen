'use client';

import { useRouter } from 'next/navigation';

export function GoBack() {
  const router = useRouter();

  return (
    <div
      className="inline-flex max-w-xs text-primary font-bold text-2xl  mt-4 pb-4 items-end cursor-pointer"
      onClick={handleBack}
    >
      <div>$ cd ..</div>
      <div className="animate-cursor-blink border-b-4 border-primary w-4 ml-2 mb-1.5"></div>
    </div>
  );

  function handleBack() {
    router.back();
  }
}
