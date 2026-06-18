const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client pointing directly to control.db
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:control.db', // relative to prisma/ directory
    },
  },
});

async function main() {
  console.log('Registering default sekolah tenant in control.db...');
  
  // Clean up any existing tenants in control.db
  await prisma.tenant.deleteMany();
  
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Sekolah Global EduFlow',
      pathSegment: 'sekolah',
      dbFilePath: 'prisma/tenants/sekolah.db',
      status: 'ACTIVE',
      subscription: {
        create: {
          plan: 'PREMIUM',
          expiresAt: new Date('2027-12-31T23:59:59Z'),
          maxUsers: 500,
        },
      },
    },
  });
  
  console.log('Tenant registered successfully:', tenant);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
