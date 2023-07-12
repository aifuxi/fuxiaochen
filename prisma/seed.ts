import { PrismaClient } from '@prisma/client';
import Mockjs from 'mockjs';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 90; i++) {
    await prisma.article.create({
      data: {
        title: Mockjs.Random.ctitle(6) + i,
        friendlyUrl: Mockjs.Random.word(),
        description: Mockjs.Random.cparagraph(),
        content: Mockjs.Random.cparagraph(),
        published: Mockjs.Random.boolean(),
      },
    });

    await prisma.tag.create({
      data: {
        name: Mockjs.Random.cword() + i,
        friendlyUrl: Mockjs.Random.word() + i,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    console.log(e);

    process.exit(1);
  });
