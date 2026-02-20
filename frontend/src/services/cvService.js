const API_URL = 'http://localhost:5000/api/v1/cv';

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

const cvService = {
  // ========== EXPERIENCES ==========
  getExperiences: async () => {
    const response = await fetch(`${API_URL}/experiences`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createExperience: async (data) => {
    const response = await fetch(`${API_URL}/experiences`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateExperience: async (id, data) => {
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteExperience: async (id) => {
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== EDUCATION ==========
  getEducation: async () => {
    const response = await fetch(`${API_URL}/education`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createEducation: async (data) => {
    const response = await fetch(`${API_URL}/education`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateEducation: async (id, data) => {
    const response = await fetch(`${API_URL}/education/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteEducation: async (id) => {
    const response = await fetch(`${API_URL}/education/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== TRAININGS ==========
  getTrainings: async () => {
    const response = await fetch(`${API_URL}/trainings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createTraining: async (data) => {
    const response = await fetch(`${API_URL}/trainings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateTraining: async (id, data) => {
    const response = await fetch(`${API_URL}/trainings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteTraining: async (id) => {
    const response = await fetch(`${API_URL}/trainings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== CERTIFICATES ==========
  getCertificates: async () => {
    const response = await fetch(`${API_URL}/certificates`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createCertificate: async (data) => {
    const response = await fetch(`${API_URL}/certificates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateCertificate: async (id, data) => {
    const response = await fetch(`${API_URL}/certificates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteCertificate: async (id) => {
    const response = await fetch(`${API_URL}/certificates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== VOLUNTEERS ==========
  getVolunteers: async () => {
    const response = await fetch(`${API_URL}/volunteers`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createVolunteer: async (data) => {
    const response = await fetch(`${API_URL}/volunteers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateVolunteer: async (id, data) => {
    const response = await fetch(`${API_URL}/volunteers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteVolunteer: async (id) => {
    const response = await fetch(`${API_URL}/volunteers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== PROJECTS ==========
  getProjects: async () => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createProject: async (data) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateProject: async (id, data) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteProject: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== SKILLS ==========
  getSkills: async () => {
    const response = await fetch(`${API_URL}/skills`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createSkill: async (data) => {
    const response = await fetch(`${API_URL}/skills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateSkill: async (id, data) => {
    const response = await fetch(`${API_URL}/skills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteSkill: async (id) => {
    const response = await fetch(`${API_URL}/skills/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========== SUMMARY ==========
  getSummary: async () => {
    const response = await fetch(`${API_URL}/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export default cvService;
