'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
  {
    label: '文章管理',
    link: '/admin/article',
  },
  {
    label: '创建/编辑文章',
    link: '/admin/create-article',
  },
  {
    label: '标签管理',
    link: '/admin/tag',
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div>
      {renderAdminNav()}
      {children}
    </div>
  );

  function renderAdminNav() {
    return (
      <ul className="flex space-x-1 pb-8 sm:space-x-4">
        {adminNavItems.map((v) => (
          <li key={v.link}>
            <Link href={v.link}>
              <Button
                size={'lg'}
                variant={pathname === v.link ? 'default' : 'outline'}
              >
                {v.label}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
};

export default AdminLayout;
