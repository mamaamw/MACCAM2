// Service pour obtenir les images des ingrédients
// Utilise Unsplash pour les images d'ingrédients

const ingredientImageMap = {
  // Fruits
  'pomme': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&h=400&fit=crop',
  'banane': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop',
  'fraise': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
  'citron': 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop',
  'tomate': 'https://images.unsplash.com/photo-1546470427-227e1e3b09e4?w=400&h=400&fit=crop',
  'avocat': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
  'raisin': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=400&h=400&fit=crop',
  'poire': 'https://images.unsplash.com/photo-1568219656418-f40b94d4c196?w=400&h=400&fit=crop',
  'ananas': 'https://images.unsplash.com/photo-1550828486-e8e5d5a9bc90?w=400&h=400&fit=crop',
  
  // Légumes
  'carotte': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
  'oignon': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
  'ail': 'https://images.unsplash.com/photo-1588878281922-c47ed52f2c87?w=400&h=400&fit=crop',
  'poivron': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop',
  'courgette': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop',
  'aubergine': 'https://images.unsplash.com/photo-1615485500834-bc10199bc5c4?w=400&h=400&fit=crop',
  'brocoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
  'chou-fleur': 'https://images.unsplash.com/photo-1568584711075-3d021a7c6c7f?w=400&h=400&fit=crop',
  'salade': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop',
  'épinard': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
  'champignon': 'https://images.unsplash.com/photo-1565360485331-244be1b1e64a?w=400&h=400&fit=crop',
  'poireau': 'https://images.unsplash.com/photo-1598885159329-c73939e3d17c?w=400&h=400&fit=crop',
  'pomme de terre': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
  
  // Viandes et poissons
  'poulet': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
  'boeuf': 'https://images.unsplash.com/photo-1607623488235-e2e5b9a3e7c5?w=400&h=400&fit=crop',
  'porc': 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop',
  'saumon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop',
  'thon': 'https://images.unsplash.com/photo-1497888329096-51c27beff665?w=400&h=400&fit=crop',
  'crevette': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop',
  'jambon': 'https://images.unsplash.com/photo-1564299261168-b9ba02f7cf58?w=400&h=400&fit=crop',
  
  // Produits laitiers
  'lait': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
  'fromage': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
  'yaourt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
  'beurre': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
  'crème': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
  'oeuf': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
  'mozzarella': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
  
  // Épicerie
  'riz': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'pâtes': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'farine': 'https://images.unsplash.com/photo-1628564583116-627073682bb7?w=400&h=400&fit=crop',
  'sucre': 'https://images.unsplash.com/photo-1587735243474-0b7beef9bdd2?w=400&h=400&fit=crop',
  'sel': 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=400&fit=crop',
  'poivre': 'https://images.unsplash.com/photo-1604265315855-d2d1680c2e1d?w=400&h=400&fit=crop',
  'huile': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
  "huile d'olive": 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
  'vinaigre': 'https://images.unsplash.com/photo-1613571995024-d0f8e2b7e60b?w=400&h=400&fit=crop',
  'miel': 'https://images.unsplash.com/photo-1587049352846-4a222e784269?w=400&h=400&fit=crop',
  'chocolat': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop',
  
  // Boulangerie
  'pain': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'baguette': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop',
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
  
  // Boissons
  'eau': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
  'jus': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
  'café': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
  'thé': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
  'vin': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
  
  // Autres
  'noix': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop',
  'amande': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop',
  'pignon': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop',
  'basilic': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=400&fit=crop',
  'persil': 'https://images.unsplash.com/photo-1557518985-9842a6c5a5f3?w=400&h=400&fit=crop',
  'coriandre': 'https://images.unsplash.com/photo-1583658066629-38b8a03ce2a5?w=400&h=400&fit=crop',
  'menthe': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&h=400&fit=crop',
};

// Image par défaut selon la catégorie
const defaultImagesByCategory = {
  'Fruits & Légumes': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=400&fit=crop',
  'Viandes & Poissons': 'https://images.unsplash.com/photo-1607623488235-e2e5b9a3e7c5?w=400&h=400&fit=crop',
  'Produits laitiers': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
  'Épicerie': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=400&fit=crop',
  'Boulangerie': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'Boissons': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
  'Surgelés': 'https://images.unsplash.com/photo-1631871377819-88e82e80bf8f?w=400&h=400&fit=crop',
  'Autre': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'
};

/**
 * Obtient l'URL de l'image pour un ingrédient
 * @param {string} ingredientName - Nom de l'ingrédient
 * @param {string} category - Catégorie de l'ingrédient
 * @returns {string} URL de l'image
 */
function getIngredientImage(ingredientName, category = 'Autre') {
  if (!ingredientName) {
    return defaultImagesByCategory[category] || defaultImagesByCategory['Autre'];
  }

  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Chercher une correspondance exacte
  if (ingredientImageMap[normalizedName]) {
    return ingredientImageMap[normalizedName];
  }
  
  // Chercher une correspondance partielle
  for (const [key, url] of Object.entries(ingredientImageMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }
  
  // Retourner l'image par défaut de la catégorie
  return defaultImagesByCategory[category] || defaultImagesByCategory['Autre'];
}

export {
  getIngredientImage,
  ingredientImageMap,
  defaultImagesByCategory
};
