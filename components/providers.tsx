"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NiceModal.Provider>
      {children}
      <Toaster
        position="top-right"
        expand
        richColors
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "!rounded-3xl !border !border-white/10 !bg-zinc-950/95 !text-zinc-50",
          },
        }}
      />
    </NiceModal.Provider>
  );
}
