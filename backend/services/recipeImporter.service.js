import fetch from 'node-fetch';

/**
 * Service pour extraire les recettes depuis diverses URLs
 */

// Décoder les entités HTML
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;
  
  const entities = {
    '&#039;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#39;': "'"
  };
  
  return text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

// Parser générique basé sur les microdonnées Schema.org
async function parseRecipeFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Essayer d'extraire les données JSON-LD (Schema.org)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        const jsonText = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        try {
          const data = JSON.parse(jsonText);
          
          // Chercher l'objet Recipe
          let recipeData = null;
          if (data['@type'] === 'Recipe') {
            recipeData = data;
          } else if (data['@graph']) {
            recipeData = data['@graph'].find(item => item['@type'] === 'Recipe');
          }
          
          if (recipeData) {
            return parseSchemaOrgRecipe(recipeData, url);
          }
        } catch (e) {
          console.log('Erreur parsing JSON-LD:', e.message);
        }
      }
    }
    
    // Fallback: parser HTML manuel
    return parseHtmlRecipe(html, url);
    
  } catch (error) {
    throw new Error(`Impossible d'importer la recette: ${error.message}`);
  }
}

// Parser les données Schema.org Recipe
function parseSchemaOrgRecipe(data, sourceUrl) {
  const recipe = {
    title: decodeHtmlEntities(data.name || 'Recette importée'),
    description: decodeHtmlEntities(data.description || ''),
    image: extractImage(data.image),
    prepTime: parseISO8601Duration(data.prepTime),
    cookTime: parseISO8601Duration(data.cookTime),
    servings: extractServings(data.recipeYield),
    category: extractCategory(data.recipeCategory),
    cuisine: extractCuisine(data.recipeCuisine),
    ingredients: extractIngredients(data.recipeIngredient),
    steps: extractSteps(data.recipeInstructions),
    source: extractDomain(sourceUrl),
    sourceUrl: sourceUrl,
    tags: extractKeywords(data.keywords),
  };
  
  return recipe;
}

// Parser HTML manuel pour les sites sans Schema.org
function parseHtmlRecipe(html, sourceUrl) {
  // Extraction basique du titre
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/ - .+$/, '').trim() : 'Recette importée';
  
  // Extraction de la description (meta description)
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1] : '';
  
  // Extraction image (og:image)
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const image = imageMatch ? imageMatch[1] : '';
  
  return {
    title,
    description,
    image,
    prepTime: null,
    cookTime: null,
    servings: 0,
    category: 'Plat',
    cuisine: '',
    ingredients: [],
    steps: [],
    source: extractDomain(sourceUrl),
    sourceUrl: sourceUrl,
    tags: [],
    notes: 'Recette importée automatiquement. Veuillez vérifier et compléter les informations.'
  };
}

// Utilitaires

function extractImage(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return image[0];
  if (image.url) return image.url;
  if (image['@list']) return image['@list'][0];
  return '';
}

function parseISO8601Duration(duration) {
  if (!duration) return null;
  // Format: PT15M, PT1H30M, etc.
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  return hours * 60 + minutes;
}

function extractServings(recipeYield) {
  if (!recipeYield) return 0;
  if (typeof recipeYield === 'number') return recipeYield;
  if (typeof recipeYield === 'string') {
    const match = recipeYield.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
  return 0;
}

function extractCategory(category) {
  if (!category) return 'Plat';
  if (Array.isArray(category)) category = category[0];
  
  const categoryMap = {
    'appetizer': 'Entrée',
    'starter': 'Entrée',
    'entrée': 'Entrée',
    'main': 'Plat',
    'main course': 'Plat',
    'plat': 'Plat',
    'dessert': 'Dessert',
    'drink': 'Boisson',
    'beverage': 'Boisson',
    'boisson': 'Boisson',
    'side': 'Accompagnement',
    'accompagnement': 'Accompagnement',
  };
  
  const normalized = category.toLowerCase();
  return categoryMap[normalized] || 'Plat';
}

function extractCuisine(cuisine) {
  if (!cuisine) return '';
  if (Array.isArray(cuisine)) {
    // Si c'est un tableau, prendre le premier élément ou joindre avec des virgules
    return cuisine.length > 0 ? cuisine[0] : '';
  }
  if (typeof cuisine === 'string') return cuisine;
  return '';
}

function extractIngredients(ingredients) {
  if (!ingredients) return [];
  if (!Array.isArray(ingredients)) ingredients = [ingredients];
  
  return ingredients.map(ing => {
    if (typeof ing === 'string') {
      const decodedIng = decodeHtmlEntities(ing);
      // Essayer de parser "200g de farine"
      const match = decodedIng.match(/^([\d.,\/\s]+)\s*([a-zéèêàâôûç]+)?\s+(.+)$/i);
      if (match) {
        return {
          quantity: match[1].trim(),
          unit: match[2] || '',
          name: match[3].trim()
        };
      }
      return { quantity: '', unit: '', name: decodedIng };
    }
    return ing;
  });
}

function extractSteps(instructions) {
  if (!instructions) return [];
  
  if (typeof instructions === 'string') {
    // Séparer par numéros ou points
    const steps = instructions.split(/\d+\.\s+|\n+/).filter(s => s.trim());
    return steps.map(step => decodeHtmlEntities(step));
  }
  
  if (Array.isArray(instructions)) {
    return instructions.map(step => {
      if (typeof step === 'string') return decodeHtmlEntities(step);
      if (step.text) return decodeHtmlEntities(step.text);
      if (step.itemListElement) {
        return extractSteps(step.itemListElement);
      }
      return '';
    }).flat().filter(s => s);
  }
  
  if (instructions.itemListElement) {
    return extractSteps(instructions.itemListElement);
  }
  
  if (instructions.text) {
    return [decodeHtmlEntities(instructions.text)];
  }
  
  return [];
}

function extractKeywords(keywords) {
  if (!keywords) return [];
  if (typeof keywords === 'string') {
    return keywords.split(',').map(k => decodeHtmlEntities(k.trim())).filter(k => k);
  }
  if (Array.isArray(keywords)) return keywords.map(k => decodeHtmlEntities(k));
  return [];
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export default {
  parseRecipeFromUrl
};
