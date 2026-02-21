const API_URL = 'http://localhost:5000/api/v1/recipes';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }
  return data;
};

const recipeService = {
  // Récupérer toutes les recettes
  getRecipes: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.isFavorite) queryParams.append('isFavorite', 'true');
    if (filters.search) queryParams.append('search', filters.search);
    
    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Récupérer une recette par ID
  getRecipe: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Créer une recette
  createRecipe: async (data) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Modifier une recette
  updateRecipe: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Supprimer une recette
  deleteRecipe: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Basculer le statut favori
  toggleFavorite: async (id) => {
    const response = await fetch(`${API_URL}/${id}/favorite`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await fetch(`${API_URL}/stats/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Importer une recette depuis une URL
  importFromUrl: async (url) => {
    const response = await fetch(`${API_URL}/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url }),
    });
    return handleResponse(response);
  }
};

export default recipeService;
