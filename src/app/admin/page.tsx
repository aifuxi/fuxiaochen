import { type Metadata } from "next";

import { PATHS, PATHS_MAP } from "@/constants";
import { AdminHomePage } from "@/features/admin";
import { getAdminPageTitle } from "@/utils";

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.ADMIN_HOME]),
};

export default function Page() {
  return <AdminHomePage />;
}
