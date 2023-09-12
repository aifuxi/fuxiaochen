import Link from 'next/link';

import { IconLogo } from '../icons';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <IconLogo className="w-12 h-12" />
    </Link>
  );
}
