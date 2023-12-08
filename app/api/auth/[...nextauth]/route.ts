/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth from 'next-auth';

import { authConfig } from '@/libs/auth';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
