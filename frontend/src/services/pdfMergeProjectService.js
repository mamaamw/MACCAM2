import api from '../lib/axios';

const pdfMergeProjectService = {
  /**
   * Créer un nouveau projet de fusion PDF
   * @param {Object} projectData - { name, description, files, filesData }
   * @returns {Promise}
   */
  createProject: async (projectData) => {
    console.log('=== CREATE PROJECT SERVICE ===')
    console.log('Nombre de fichiers reçus:', projectData.files.length)
    
    const formData = new FormData();
    formData.append('name', projectData.name);
    if (projectData.description) {
      formData.append('description', projectData.description);
    }
    
    // Ajouter les fichiers
    projectData.files.forEach((fileInfo, index) => {
      console.log(`Ajout fichier ${index}:`, {
        name: fileInfo.name,
        hasFile: !!fileInfo.file,
        fileType: fileInfo.file?.type,
        fileName: fileInfo.file?.name
      })
      formData.append('files', fileInfo.file);
    });
    
    // Ajouter les métadonnées des fichiers
    const filesMetadata = projectData.files.map(f => ({
      name: f.name,
      pageCount: f.pageCount,
      selectedPages: f.selectedPages
    }));
    console.log('Métadonnées:', filesMetadata)
    formData.append('filesData', JSON.stringify(filesMetadata));
    
    // Log FormData content
    console.log('FormData entries:')
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], ':', pair[1].name, pair[1].size, 'bytes')
      } else {
        console.log(pair[0], ':', pair[1])
      }
    }
    
    const response = await api.post('/pdf-merge-projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Récupérer tous les projets de l'utilisateur
   * @returns {Promise}
   */
  getProjects: async () => {
    const response = await api.get('/pdf-merge-projects');
    return response.data;
  },

  /**
   * Récupérer un projet spécifique
   * @param {string} projectId
   * @returns {Promise}
   */
  getProject: async (projectId) => {
    const response = await api.get(`/pdf-merge-projects/${projectId}`);
    return response.data;
  },

  /**
   * Récupérer les fichiers d'un projet
   * @param {string} projectId
   * @returns {Promise}
   */
  getProjectFiles: async (projectId) => {
    const response = await api.get(`/pdf-merge-projects/${projectId}/files`);
    return response.data;
  },

  /**
   * Télécharger un fichier d'un projet
   * @param {string} projectId
   * @param {string} filename
   * @returns {string} URL du fichier
   */
  getFileUrl: (projectId, filename) => {
    return `${api.defaults.baseURL}/pdf-merge-projects/${projectId}/file/${encodeURIComponent(filename)}`;
  },

  /**
   * Charger un fichier d'un projet
   * @param {string} projectId
   * @param {string} filename
   * @returns {Promise<Blob>}
   */
  downloadFile: async (projectId, filename) => {
    const response = await api.get(`/pdf-merge-projects/${projectId}/file/${encodeURIComponent(filename)}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Mettre à jour un projet
   * @param {string} projectId
   * @param {Object} updates - { name?, description?, filesData? }
   * @returns {Promise}
   */
  updateProject: async (projectId, updates) => {
    const response = await api.put(`/pdf-merge-projects/${projectId}`, updates);
    return response.data;
  },

  /**
   * Supprimer un projet
   * @param {string} projectId
   * @returns {Promise}
   */
  deleteProject: async (projectId) => {
    const response = await api.delete(`/pdf-merge-projects/${projectId}`);
    return response.data;
  }
};

export default pdfMergeProjectService;
