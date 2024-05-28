import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    include: { tags: true },
  });

  return new Response(JSON.stringify(posts));
}
