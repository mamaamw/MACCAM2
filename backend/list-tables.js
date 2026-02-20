import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
  try {
    // Query raw SQL to list tables in SQLite
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    
    console.log('Tables in database:');
    tables.forEach(table => console.log('  -', table.name));
    
    // Check for CV tables specifically
    const cvTables = ['experiences', 'education', 'trainings', 'certificates', 'volunteers', 'cv_projects', 'skills'];
    console.log('\nCV Tables status:');
    cvTables.forEach(tableName => {
      const exists = tables.some(t => t.name === tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();
