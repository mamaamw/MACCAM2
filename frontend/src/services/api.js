import api from '../lib/axios';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/updateprofile', profileData);
    return data;
  },

  updatePassword: async (passwordData) => {
    const { data } = await api.put('/auth/updatepassword', passwordData);
    return data;
  },
};

export const customerService = {
  getAll: async (params) => {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (customerData) => {
    const { data } = await api.post('/customers', customerData);
    return data;
  },

  update: async (id, customerData) => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },
};

export const leadService = {
  getAll: async (params) => {
    const { data } = await api.get('/leads', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  create: async (leadData) => {
    const { data } = await api.post('/leads', leadData);
    return data;
  },

  update: async (id, leadData) => {
    const { data } = await api.put(`/leads/${id}`, leadData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  },
};

export const projectService = {
  getAll: async (params) => {
    const { data } = await api.get('/projects', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  create: async (projectData) => {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  update: async (id, projectData) => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};

export const taskService = {
  getAll: async (params) => {
    const { data } = await api.get('/tasks', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  update: async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

export const invoiceService = {
  getAll: async (params) => {
    const { data } = await api.get('/invoices', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  create: async (invoiceData) => {
    const { data } = await api.post('/invoices', invoiceData);
    return data;
  },

  update: async (id, invoiceData) => {
    const { data } = await api.put(`/invoices/${id}`, invoiceData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  },
};
