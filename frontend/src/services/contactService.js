import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/contacts';

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

export const contactService = {
  // Liste des contacts
  getAllContacts: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Détails d'un contact
  getContactById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Créer un contact
  createContact: async (contactData) => {
    const response = await api.post('/', contactData);
    return response.data;
  },

  // Modifier un contact
  updateContact: async (id, contactData) => {
    const response = await api.put(`/${id}`, contactData);
    return response.data;
  },

  // Activer un contact (le transformer en utilisateur)
  activateContact: async (id, activationData) => {
    const response = await api.put(`/${id}/activate`, activationData);
    return response.data;
  },

  // Désactiver un utilisateur
  deactivateContact: async (id) => {
    const response = await api.put(`/${id}/deactivate`);
    return response.data;
  },

  // Supprimer un contact
  deleteContact: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};
