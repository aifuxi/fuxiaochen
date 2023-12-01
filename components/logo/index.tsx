import Link from 'next/link';

import { IconLogo } from '../icons';

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <IconLogo className="h-16 w-16" />
    </Link>
  );
}
