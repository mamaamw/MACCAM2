import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCvModels() {
  try {
    console.log('Testing CV models...');
    
    // Test if models exist
    console.log('Experience model:', typeof prisma.experience);
    console.log('Education model:', typeof prisma.education);
    console.log('Training model:', typeof prisma.training);
    console.log('Certificate model:', typeof prisma.certificate);
    console.log('Volunteer model:', typeof prisma.volunteer);
    console.log('CvProject model:', typeof prisma.cvProject);
    console.log('Skill model:', typeof prisma.skill);
    
    // Try to query experiences
    const experiences = await prisma.experience.findMany();
    console.log('Experiences found:', experiences.length);
    
    console.log('✅ All CV models are working!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCvModels();
