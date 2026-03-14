const prisma = require("./config/db");

async function test() {
  const articles = await prisma.article.findMany({
    take: 1
  });

  console.log("查询结果:", articles);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());