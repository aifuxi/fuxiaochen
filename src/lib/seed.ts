/* eslint-disable  */
import { type Prisma, PrismaClient } from "@prisma/client";

import { hashPassword } from "./bcrypt";

const prisma = new PrismaClient();
async function main() {
  await seedUsers();
  await seedCategories();
  await seedTags();
}

async function seedUsers() {
  const users: Prisma.UserCreateManyInput[] = [];
  const password = await hashPassword("123456");
  for (let i = 0; i < 100; i++) {
    users.push({
      name: `test${i}`,
      email: `test${i}@test.com`,
      password,
    });
  }

  const result = await prisma.user.createMany({ data: users });

  console.log("用户模拟数据插入完毕", result);
}

async function seedTags() {
  const tags: Prisma.TagCreateManyInput[] = [];
  for (let i = 0; i < 30; i++) {
    tags.push({
      name: `测试标签${i}`,
      slug: `tag-slug${i}`,
      description: "我是标签描述",
    });
  }

  const result = await prisma.tag.createMany({ data: tags });

  console.log("标签模拟数据插入完毕", result);
}

async function seedCategories() {
  const categories: Prisma.CategoryCreateManyInput[] = [];

  for (let i = 0; i < 5; i++) {
    categories.push({
      name: `测试分类${i}`,
      slug: `category-slug${i}`,
      description: "我是分类描述",
    });
  }

  const result = await prisma.category.createMany({ data: categories });

  console.log("分类模拟数据插入完毕", result);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
