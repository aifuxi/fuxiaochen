import { auth } from '@/libs/auth';

export default async function CheckLoginPage() {
  const session = await auth();
  return <div>{JSON.stringify(session, null, 2)}</div>;
}
