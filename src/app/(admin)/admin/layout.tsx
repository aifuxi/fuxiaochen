import * as React from "react";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";

import { NICKNAME } from "@/constants/info";

import { Navbar } from "./_components/navbar";
import { ProfileEntry } from "./_components/profile-entry";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <SessionProvider>
      <div className="flex flex-col">
        <header className="flex h-16 items-center border-b border-solid px-5">
          <Link href="/" className="flex items-center">
            <img src="/images/fuxiaochen-logo.svg" className="mr-2 size-8" />
            <span className="text-base font-medium">{NICKNAME}</span>
          </Link>
          <Navbar />
          <div className="flex items-center">
            <ProfileEntry />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
