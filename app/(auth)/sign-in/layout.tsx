import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户登录',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
