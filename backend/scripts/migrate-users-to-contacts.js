import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUsersToContacts() {
  try {
    console.log('🔄 Migration : Tous les utilisateurs deviennent des contacts...\n');

    // Mettre à jour tous les utilisateurs pour qu'ils soient aussi des contacts
    const result = await prisma.user.updateMany({
      where: {
        isContact: false
      },
      data: {
        isContact: true
      }
    });

    console.log(`✅ ${result.count} utilisateur(s) mis à jour avec isContact: true`);
    
    // Afficher le résumé
    const totalUsers = await prisma.user.count();
    const totalContacts = await prisma.user.count({
      where: { isContact: true }
    });

    console.log(`\n📊 Résumé :`);
    console.log(`   Total utilisateurs : ${totalUsers}`);
    console.log(`   Total contacts : ${totalContacts}`);
    console.log('\n✨ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToContacts();
