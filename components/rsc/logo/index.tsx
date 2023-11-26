import Link from 'next/link';

import { IconLogo } from '../icons';

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <IconLogo className="h-12 w-12" />
    </Link>
  );
}
