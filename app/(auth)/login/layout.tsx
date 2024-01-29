import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户登录',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // const session = await auth();
  // if (session?.user.email) {
  //   redirect(PATHS.ADMIN_HOME);
  // }
  return <>{children}</>;
}
