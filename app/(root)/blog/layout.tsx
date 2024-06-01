import React from "react";

import { type Metadata } from "next";

import { PATHS, PATHS_MAP, PATH_DESCRIPTION_MAP } from "@/constants";

export const metadata: Metadata = {
  title: PATHS_MAP[PATHS.SITE_BLOG],
  description: PATH_DESCRIPTION_MAP[PATHS.SITE_BLOG],
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
