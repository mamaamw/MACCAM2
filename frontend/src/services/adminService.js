import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/users';

const getAuthToken = () => {
  const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  return auth?.state?.token || '';
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des utilisateurs
export const adminService = {
  // Liste des utilisateurs
  getAllUsers: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Détails d'un utilisateur
  getUserById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Créer un utilisateur
  createUser: async (userData) => {
    const response = await api.post('/', userData);
    return response.data;
  },

  // Modifier un utilisateur
  updateUser: async (id, userData) => {
    const response = await api.put(`/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};
