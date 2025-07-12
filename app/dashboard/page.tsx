import { type Metadata } from "next";

import { PATHS, PATHS_MAP } from "@/constants";
import { getAdminPageTitle } from "@/utils";

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.DASHBOARD]),
};

export default function Page() {
  return <div>Dashboard Page</div>;
}
