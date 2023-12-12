import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '创建用户',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
