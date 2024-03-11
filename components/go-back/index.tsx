'use client';

import { useRouter } from 'next/navigation';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function GoBack() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="inline-flex max-w-[100px] text-primary font-bold text-2xl  mt-4 pb-4 items-end cursor-pointer"
          onClick={handleBack}
        >
          <div>$ cd ..</div>
          <div className="animate-cursor-blink border-b-4 border-primary w-4 ml-2 mb-1.5"></div>
        </div>
      </TooltipTrigger>
      <TooltipContent>返回上一页</TooltipContent>
    </Tooltip>
  );

  function handleBack() {
    router.back();
  }
}
