import { AuthLayout } from '@/features/auth';

export default function Layout({ children }: React.PropsWithChildren) {
  return <AuthLayout>{children}</AuthLayout>;
}
