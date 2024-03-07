import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '创建文章',
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
