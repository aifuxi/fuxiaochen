/* eslint-disable */
// tsx直接执行ts代码稍微有点问题
// 详情请看这个issue: https://github.com/privatenumber/tsx/issues/38
// 这里暂时换成.cjs的写法

/* eslint-disable no-console */

const path = require('node:path');
const hashSync = require('bcryptjs').hashSync;
const PrismaClient = require('@prisma/client').PrismaClient;

const pwd = process.cwd();
const envFilePath =
  process.env.NODE_ENV === 'production'
    ? path.join(pwd, '.env.production')
    : path.join(pwd, '.env.development');

require('dotenv').config({ path: envFilePath });

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = hashSync(process.env.ADMIN_PASSWORD);

    const user = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        image: process.env.ADMIN_AVATAR,
        name: process.env.ADMIN_NICKNAME,
        password: hashedPassword,
      },
    });

    if (user) {
      const { password, ...safeUser } = user;

      console.log('默认新增用户：', safeUser);
    }
  } catch (e) {
    console.error(e);
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
