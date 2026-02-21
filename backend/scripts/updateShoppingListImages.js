// Script pour mettre à jour les images des items existants dans la liste de courses
import { PrismaClient } from '@prisma/client';
import { getIngredientImage } from '../services/ingredientImages.service.js';

const prisma = new PrismaClient();

async function updateImages() {
  try {
    console.log('Récupération des items sans image...');
    
    const items = await prisma.shoppingListItem.findMany({
      where: {
        OR: [
          { image: null },
          { image: '' }
        ]
      }
    });

    console.log(`${items.length} items trouvés sans image.`);

    for (const item of items) {
      const image = getIngredientImage(item.name, item.category);
      
      await prisma.shoppingListItem.update({
        where: { id: item.id },
        data: { image }
      });

      console.log(`✓ Image ajoutée pour: ${item.name}`);
    }

    console.log('\n✅ Mise à jour terminée!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImages();
