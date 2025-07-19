import * as React from "react";

import Image from "next/image";

import { ImageAssets, WEBSITE } from "@/constants";

export const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="grid min-h-svh place-content-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image src={ImageAssets.logo} width={48} height={48} alt="" />
        <h2 className="text-2xl font-bold text-8xl">{WEBSITE}</h2>
        {children}
      </div>
    </div>
  );
};
