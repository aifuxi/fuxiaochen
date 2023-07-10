import { fakerZH_CN as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 30; i++) {
    await prisma.article.create({
      data: {
        title: faker.location.streetAddress({ useFullAddress: true }),
        friendlyUrl: faker.lorem.slug(),
        description: faker.lorem.paragraph(),
        content: faker.lorem.paragraphs(30),
        published: faker.datatype.boolean(),
      },
    });

    await prisma.tag.create({
      data: {
        name: faker.person.suffix() + i,
        friendlyUrl: faker.lorem.slug(),
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
