import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const seeds = [
    { type: 'success', status: 'completed', duration: 45 },
    { type: 'success', status: 'completed', duration: 78 },
    { type: 'slow_request', status: 'completed', duration: 3200, metadata: { delay: 3000 } },
    { type: 'validation_error', status: 'error', error: 'Validation failed' },
    { type: 'system_error', status: 'error', error: 'Simulated system error' },
    { type: 'teapot', status: 'completed', duration: 12, metadata: { easter: true } },
  ];

  for (const seed of seeds) {
    await prisma.scenarioRun.create({ data: seed });
  }

  console.log(`Seeded ${seeds.length} scenario runs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
