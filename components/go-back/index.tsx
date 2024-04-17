'use client';

import { useRouter } from 'next/navigation';

export function GoBack() {
  const router = useRouter();

  return (
    <div
      className="inline-flex w-1/2 border rounded-lg text-primary font-bold text-2xl  mt-8 pl-4 py-8 items-end cursor-pointer"
      onClick={handleBack}
      title="返回上一页"
    >
      <div>$ cd ..</div>
      <div className="animate-cursor-blink border-b-4 border-primary w-4 ml-2 mb-1.5"></div>
    </div>
  );

  function handleBack() {
    router.back();
  }
}
