const API_URL = 'http://localhost:5000/api/v1/users';

// Récupérer le token depuis localStorage
const getAuthToken = () => {
  const auth = localStorage.getItem('auth-storage');
  if (auth) {
    const parsed = JSON.parse(auth);
    return parsed.state?.token;
  }
  return null;
};

// Headers par défaut avec authentification
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Gérer les erreurs API
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }
  
  return data;
};

// Service pour les opérations utilisateur
const userService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await fetch(`${API_URL}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  // Récupérer l'historique d'activité
  getActivity: async () => {
    const response = await fetch(`${API_URL}/activity`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Récupérer les préférences de notification
  getNotificationSettings: async () => {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Mettre à jour les préférences de notification
  updateNotificationSettings: async (settings) => {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  // Activer/Désactiver 2FA
  toggle2FA: async (enabled) => {
    const response = await fetch(`${API_URL}/2fa`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ enabled }),
    });
    return handleResponse(response);
  },

  // Récupérer la liste des utilisateurs (Admin/Manager)
  getUsers: async () => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Créer un utilisateur (Admin)
  createUser: async (userData) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Mettre à jour un utilisateur (Admin/Manager)
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Supprimer un utilisateur (Admin)
  deleteUser: async (userId) => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export default userService;
