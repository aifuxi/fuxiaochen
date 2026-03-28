import { CmsLayout } from "@/components/dashboard/cms-layout";

export default function Layout({ children }: React.PropsWithChildren) {
  return <CmsLayout>{children}</CmsLayout>;
}
