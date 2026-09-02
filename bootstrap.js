const { spawnSync } = require('child_process');

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    ...options,
  });

  if (result.status !== 0) {
    console.error(`Command failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('Initializing LoyaltyPro database...');

// Create tables in Supabase
run(
  process.execPath,
  [
    'backend/node_modules/prisma/build/index.js',
    'db',
    'push',
    '--schema=backend/prisma/schema.prisma',
  ]
);

// Seed admin + normal test user
run(process.execPath, ['backend/seed.js']);

console.log('\nDatabase initialization completed.');
console.log('Starting LoyaltyPro...');

require('./start.js');
