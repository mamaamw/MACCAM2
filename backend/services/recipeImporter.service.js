import fetch from 'node-fetch';

/**
 * Service pour extraire les recettes depuis diverses URLs
 */

// Décoder les entités HTML
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Décoder d'abord les entités URL-encoded (%20, etc.)
  try {
    text = decodeURIComponent(text.replace(/\+/g, ' '));
  } catch (e) {
    // Si le décodage échoue, continuer avec le texte original
  }
  
  const entities = {
    '&#039;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#39;': "'",
    '&#x20;': ' ',
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&agrave;': 'à',
    '&acirc;': 'â',
    '&ocirc;': 'ô',
    '&ucirc;': 'û',
    '&ccedil;': 'ç',
    '&iuml;': 'ï',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
  };
  
  // Remplacer les entités HTML nommées
  text = text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
  
  // Remplacer les entités hexadécimales restantes (&#x[hex];)
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Remplacer les entités décimales (&#[num];)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  return text;
}

// Parser générique basé sur les microdonnées Schema.org
async function parseRecipeFromUrl(url) {
  try {
    console.log('🔍 Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('✅ HTML fetched, length:', html.length);
    
    // Essayer d'extraire les données JSON-LD (Schema.org)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    
    if (jsonLdMatch) {
      console.log('📦 Found', jsonLdMatch.length, 'JSON-LD blocks');
      
      for (let i = 0; i < jsonLdMatch.length; i++) {
        const script = jsonLdMatch[i];
        const jsonText = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        try {
          const data = JSON.parse(jsonText);
          console.log(`📄 Block ${i+1} @type:`, data['@type'] || (data['@graph'] ? 'Graph' : 'Unknown'));
          
          // Chercher l'objet Recipe
          let recipeData = null;
          if (data['@type'] === 'Recipe') {
            recipeData = data;
            console.log('✅ Found Recipe in block', i+1);
          } else if (data['@graph']) {
            recipeData = data['@graph'].find(item => item['@type'] === 'Recipe');
            if (recipeData) {
              console.log('✅ Found Recipe in @graph of block', i+1);
            }
          }
          
          if (recipeData) {
            console.log('🍳 Recipe title:', recipeData.name);
            console.log('📝 Ingredients count:', recipeData.recipeIngredient?.length || 0);
            console.log('📋 Instructions type:', typeof recipeData.recipeInstructions);
            const parsed = parseSchemaOrgRecipe(recipeData, url);
            console.log('✅ Successfully parsed recipe:', parsed.title);
            return parsed;
          }
        } catch (e) {
          console.log(`❌ Error parsing JSON-LD block ${i+1}:`, e.message);
        }
      }
    } else {
      console.log('⚠️ No JSON-LD found in HTML');
    }
    
    // Fallback: parser HTML manuel
    console.log('🔄 Falling back to HTML parsing');
    const parsed = parseHtmlRecipe(html, url);
    console.log('✅ HTML parsing complete');
    return parsed;
    
  } catch (error) {
    console.error('❌ Import error:', error.message);
    throw new Error(`Impossible d'importer la recette: ${error.message}`);
  }
}

// Parser les données Schema.org Recipe
function parseSchemaOrgRecipe(data, sourceUrl) {
  const recipe = {
    title: decodeHtmlEntities(data.name || 'Recette importée'),
    description: decodeHtmlEntities(data.description || ''),
    image: extractImage(data.image) || '',
    prepTime: parseISO8601Duration(data.prepTime) || '',
    cookTime: parseISO8601Duration(data.cookTime) || '',
    servings: extractServings(data.recipeYield) || 0,
    category: extractCategory(data.recipeCategory) || 'Plat',
    cuisine: extractCuisine(data.recipeCuisine) || '',
    ingredients: extractIngredients(data.recipeIngredient) || [],
    steps: extractSteps(data.recipeInstructions) || [],
    source: extractDomain(sourceUrl) || '',
    sourceUrl: sourceUrl || '',
    tags: extractKeywords(data.keywords) || [],
    notes: '',
    difficulty: 'Inconnue'
  };
  
  return recipe;
}

// Parser HTML manuel pour les sites sans Schema.org
function parseHtmlRecipe(html, sourceUrl) {
  console.log('🔧 Starting HTML parsing...');
  
  // Extraction basique du titre
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/ - .+$/, '').trim()) : 'Recette importée';
  
  console.log('📝 Title:', title);
  
  // Extraction de la description (meta description)
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  let description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';
  
  console.log('📄 Description:', description);
  
  // Extraction image (og:image)
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  let image = imageMatch ? imageMatch[1] : '';
  
  // Alternative: chercher dans toutes les balises meta image
  if (!image) {
    const altImageMatch = html.match(/<meta[^>]*property=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    if (altImageMatch) image = altImageMatch[1];
  }
  
  console.log('🖼️ Image:', image ? 'Found' : 'Not found');
  
  // Essayer d'extraire les ingrédients avec différents patterns
  let ingredients = [];
  
  // Pattern 1: Marmiton moderne - Chercher dans les divs/spans avec attributs data-
  const dataIngredientsMatch = html.match(/<div[^>]*data-ingredient[^>]*>[\s\S]*?<\/div>/gi);
  if (dataIngredientsMatch) {
    console.log('🔍 Found data-ingredient divs:', dataIngredientsMatch.length);
    for (const div of dataIngredientsMatch) {
      const quantityMatch = div.match(/data-quantity=["']([^"']*)["']/i);
      const unitMatch = div.match(/data-unit=["']([^"']*)["']/i);
      const nameMatch = div.match(/>([^<]+)</);
      
      if (nameMatch) {
        ingredients.push({
          quantity: quantityMatch ? decodeHtmlEntities(quantityMatch[1]) : '',
          unit: unitMatch ? decodeHtmlEntities(unitMatch[1]) : '',
          name: decodeHtmlEntities(nameMatch[1].trim())
        });
      }
    }
    if (ingredients.length > 0) {
      console.log('✅ Found ingredients from data-ingredient:', ingredients.length);
    }
  }
  
  // Pattern 2: Chercher dans les sections d'ingrédients
  if (ingredients.length === 0) {
    // Chercher une section avec le mot "ingrédient"
    const ingredientSectionMatch = html.match(/<div[^>]*class="[^"]*ingredient[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
    if (ingredientSectionMatch) {
      console.log('🔍 Found ingredient section divs:', ingredientSectionMatch.length);
      for (const section of ingredientSectionMatch) {
        // Extraire le texte sans les balises HTML
        const text = section.replace(/<[^>]+>/g, ' ').trim();
        if (text && text.length > 3 && !text.match(/ingredient/i)) {
          ingredients.push({ quantity: '', unit: '', name: decodeHtmlEntities(text) });
        }
      }
      if (ingredients.length > 0) {
        console.log('✅ Found ingredients from sections:', ingredients.length);
      }
    }
  }
  
  // Pattern 3: Chercher des listes <li> contenant le mot ingrédient ou dans une section ingrédients
  if (ingredients.length === 0) {
    const listItemMatches = html.matchAll(/<li[^>]*>((?:(?!<\/li>).)*)<\/li>/gi);
    const tempIngredients = [];
    for (const match of listItemMatches) {
      const text = match[1].replace(/<[^>]+>/g, ' ').trim();
      // Vérifier si ça ressemble à un ingrédient (contient des mots comme "tranches", "grammes", ou commence par un chiffre)
      if (text && text.length > 2 && (
        text.match(/^\d/) || 
        text.match(/tranche|gramme|cuiller|tasse|bouquet|pincée|gousse|litre|ml|cl|kg|beurre|pain|fromage|lait|œuf|farine/i)
      )) {
        tempIngredients.push({ quantity: '', unit: '', name: decodeHtmlEntities(text) });
      }
    }
    if (tempIngredients.length > 0) {
      ingredients = tempIngredients;
      console.log('✅ Found ingredients from list items:', ingredients.length);
    }
  }
  
  console.log('🥕 Total ingredients:', ingredients.length);
  
  // Essayer d'extraire les étapes
  let steps = [];
  
  // Pattern 1: Chercher des divs/sections avec "step" ou "étape"
  const stepDivMatches = html.matchAll(/<div[^>]*class="[^"]*(?:step|etape)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
  for (const match of stepDivMatches) {
    const text = match[1].replace(/<[^>]+>/g, ' ').trim();
    if (text && text.length > 10) {
      steps.push(decodeHtmlEntities(text));
    }
  }
  if (steps.length > 0) {
    console.log('✅ Found steps from div.step:', steps.length);
  }
  
  // Pattern 2: Chercher des listes numérotées qui ressemblent à des instructions
  if (steps.length === 0) {
    const orderedListMatch = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/gi);
    if (orderedListMatch) {
      for (const ol of orderedListMatch) {
        const listItems = ol.matchAll(/<li[^>]*>((?:(?!<\/li>).)*)<\/li>/gi);
        const tempSteps = [];
        for (const match of listItems) {
          const text = match[1].replace(/<[^>]+>/g, ' ').trim();
          if (text && text.length > 10) {
            tempSteps.push(decodeHtmlEntities(text));
          }
        }
        if (tempSteps.length > 0) {
          steps = tempSteps;
          console.log('✅ Found steps from ordered list:', steps.length);
          break;
        }
      }
    }
  }
  
  // Pattern 3: Chercher des paragraphes après un titre "Préparation" ou "Étapes"
  if (steps.length === 0) {
    const preparationMatch = html.match(/(?:Préparation|Étapes|Instructions)[^<]*<\/h\d>([\s\S]*?)(?:<h\d|<div class=")/i);
    if (preparationMatch) {
      const paragraphs = preparationMatch[1].matchAll(/<p[^>]*>((?:(?!<\/p>).)*)<\/p>/gi);
      for (const match of paragraphs) {
        const text = match[1].replace(/<[^>]+>/g, ' ').trim();
        if (text && text.length > 10) {
          steps.push(decodeHtmlEntities(text));
        }
      }
      if (steps.length > 0) {
        console.log('✅ Found steps from preparation section:', steps.length);
      }
    }
  }
  
  console.log('📋 Total steps:', steps.length);
  
  // Extraction du temps de préparation
  let prepTime = '';
  const prepTimeMatch = html.match(/[Pp]r[ée]paration[^:]*:?\s*(\d+)\s*min/);
  if (prepTimeMatch) {
    prepTime = parseInt(prepTimeMatch[1]);
    console.log('⏱️ Prep time:', prepTime, 'min');
  }
  
  // Extraction du temps de cuisson
  let cookTime = '';
  const cookTimeMatch = html.match(/[Cc]uisson[^:]*:?\s*(\d+)\s*min/);
  if (cookTimeMatch) {
    cookTime = parseInt(cookTimeMatch[1]);
    console.log('🔥 Cook time:', cookTime, 'min');
  }
  
  // Extraction du nombre de portions
  let servings = 0;
  const servingsMatch = html.match(/pour\s*(\d+)\s*personnes?/i);
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1]);
    console.log('👥 Servings:', servings);
  }
  
  return {
    title,
    description,
    image,
    prepTime,
    cookTime,
    servings,
    category: 'Plat',
    difficulty: 'Inconnue',
    cuisine: '',
    ingredients,
    steps,
    source: extractDomain(sourceUrl),
    sourceUrl: sourceUrl,
    tags: [],
    notes: ingredients.length === 0 || steps.length === 0 
      ? 'Recette importée automatiquement. Certaines informations n\'ont pas pu être extraites. Veuillez vérifier et compléter manuellement.'
      : 'Recette importée automatiquement. Veuillez vérifier les informations.'
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
  if (!duration) return '';
  // Format: PT15M, PT1H30M, etc.
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return '';
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
