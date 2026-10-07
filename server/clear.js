const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.appUser.deleteMany({
    where: {
      email: { not: 'admin@helphive.com' }
    }
  });
  console.log('Successfully cleared dummy users and reviews!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
