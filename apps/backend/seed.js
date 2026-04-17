const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.scenarioRun.count();
  if (count > 0) {
    console.log(`DB already has ${count} runs, skipping seed`);
    return;
  }
  await prisma.scenarioRun.createMany({
    data: [
      { type: 'success', status: 'completed', duration: 45 },
      { type: 'success', status: 'completed', duration: 120 },
      { type: 'slow_request', status: 'completed', duration: 3200, metadata: { delay: 3000 } },
      { type: 'validation_error', status: 'error', error: 'Validation failed: scenario rejected by business rules' },
      { type: 'system_error', status: 'error', error: 'Simulated system error: unhandled exception' },
      { type: 'teapot', status: 'completed', duration: 12, metadata: { easter: true, signal: 42 } },
    ],
  });
  console.log('Seeded 6 scenario runs');
}

main()
  .catch((e) => console.log('Seed error (non-fatal):', e.message))
  .finally(() => prisma.$disconnect());
