import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 30; i++) {
    await prisma.article.create({
      data: {
        title: `文章标题-${i + 1}`,
        friendlyUrl: `article_${i + 1}`,
        description: `我是文章描述，嘻嘻嘻，我有一头小毛驴呀重来也不骑，有一天我心血来潮骑着xxxxx${i}`,
        content: `我是文章内容，嘻嘻嘻，我有一头小毛驴呀重来也不骑，有一天我心血来潮骑着xxxxx${i}`,
        published: true,
      },
    });

    await prisma.tag.create({
      data: {
        name: `话题-${i + 1}`,
        friendlyUrl: `tag_${i + 1}`,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
