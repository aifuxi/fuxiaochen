import { type Prisma, PrismaClient } from "@prisma/client";

import { hashPassword } from "./bcrypt";

const prisma = new PrismaClient();
async function main() {
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
  // eslint-disable-next-line no-console
  console.log("db seed success", result);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
