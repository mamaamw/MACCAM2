import api from '../lib/axios'

const notionPageService = {
  getAll: async () => {
    const response = await api.get('/notion-pages')
    return response.data
  },

  getOne: async (pageId) => {
    const response = await api.get(`/notion-pages/${pageId}`)
    return response.data
  },

  create: async (payload) => {
    const response = await api.post('/notion-pages', payload)
    return response.data
  },

  update: async (pageId, payload) => {
    const response = await api.put(`/notion-pages/${pageId}`, payload)
    return response.data
  },

  delete: async (pageId) => {
    const response = await api.delete(`/notion-pages/${pageId}`)
    return response.data
  }
}

export default notionPageService
