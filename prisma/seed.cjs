/* eslint-disable */
// tsx直接执行ts代码稍微有点问题
// 详情请看这个issue: https://github.com/privatenumber/tsx/issues/38
// 这里暂时换成.cjs的写法

/* eslint-disable no-console */

const hashSync = require('bcryptjs').hashSync;

const PrismaClient = require('@prisma/client').PrismaClient;

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = hashSync('123456');

    const user = await prisma.user.create({
      data: {
        email: 'aifuxi@aifuxi.cool',
        name: 'aifuxi',
        password: hashedPassword,
      },
    });

    console.log('默认新增用户：', user);
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
