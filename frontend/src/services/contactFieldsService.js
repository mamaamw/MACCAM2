import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/contact-fields';

// Créer une instance axios avec intercepteur pour le token
const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state && parsed.state.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (error) {
        console.error('Erreur parse token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const contactFieldsService = {
  // ========== EMAILS ==========
  async getEmails(userId) {
    const response = await api.get(`/${userId}/emails`);
    return response.data;
  },
  
  async addEmail(userId, data) {
    const response = await api.post(`/${userId}/emails`, data);
    return response.data;
  },
  
  async updateEmail(emailId, data) {
    const response = await api.put(`/emails/${emailId}`, data);
    return response.data;
  },
  
  async deleteEmail(emailId) {
    const response = await api.delete(`/emails/${emailId}`);
    return response.data;
  },
  
  // ========== PHONES ==========
  async getPhones(userId) {
    const response = await api.get(`/${userId}/phones`);
    return response.data;
  },
  
  async addPhone(userId, data) {
    const response = await api.post(`/${userId}/phones`, data);
    return response.data;
  },
  
  async updatePhone(phoneId, data) {
    const response = await api.put(`/phones/${phoneId}`, data);
    return response.data;
  },
  
  async deletePhone(phoneId) {
    const response = await api.delete(`/phones/${phoneId}`);
    return response.data;
  },
  
  // ========== ADDRESSES ==========
  async getAddresses(userId) {
    const response = await api.get(`/${userId}/addresses`);
    return response.data;
  },
  
  async addAddress(userId, data) {
    const response = await api.post(`/${userId}/addresses`, data);
    return response.data;
  },
  
  async updateAddress(addressId, data) {
    const response = await api.put(`/addresses/${addressId}`, data);
    return response.data;
  },
  
  async deleteAddress(addressId) {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },
  
  // ========== WEBSITES ==========
  async getWebsites(userId) {
    const response = await api.get(`/${userId}/websites`);
    return response.data;
  },
  
  async addWebsite(userId, data) {
    const response = await api.post(`/${userId}/websites`, data);
    return response.data;
  },
  
  async updateWebsite(websiteId, data) {
    const response = await api.put(`/websites/${websiteId}`, data);
    return response.data;
  },
  
  async deleteWebsite(websiteId) {
    const response = await api.delete(`/websites/${websiteId}`);
    return response.data;
  },
  
  // ========== DATES ==========
  async getDates(userId) {
    const response = await api.get(`/${userId}/dates`);
    return response.data;
  },
  
  async addDate(userId, data) {
    const response = await api.post(`/${userId}/dates`, data);
    return response.data;
  },
  
  async updateDate(dateId, data) {
    const response = await api.put(`/dates/${dateId}`, data);
    return response.data;
  },
  
  async deleteDate(dateId) {
    const response = await api.delete(`/dates/${dateId}`);
    return response.data;
  },
  
  // ========== RELATIONS ==========
  async getRelations(userId) {
    const response = await api.get(`/${userId}/relations`);
    return response.data;
  },
  
  async addRelation(userId, data) {
    const response = await api.post(`/${userId}/relations`, data);
    return response.data;
  },
  
  async updateRelation(relationId, data) {
    const response = await api.put(`/relations/${relationId}`, data);
    return response.data;
  },
  
  async deleteRelation(relationId) {
    const response = await api.delete(`/relations/${relationId}`);
    return response.data;
  },
  
  // ========== CUSTOM FIELDS ==========
  async getCustomFields(userId) {
    const response = await api.get(`/${userId}/custom`);
    return response.data;
  },
  
  async addCustomField(userId, data) {
    const response = await api.post(`/${userId}/custom`, data);
    return response.data;
  },
  
  async updateCustomField(fieldId, data) {
    const response = await api.put(`/custom/${fieldId}`, data);
    return response.data;
  },
  
  async deleteCustomField(fieldId) {
    const response = await api.delete(`/custom/${fieldId}`);
    return response.data;
  },
  
  // ========== GET ALL (utile pour charger tout d'un coup) ==========
  async getAllFields(userId) {
    const [emails, phones, addresses, websites, dates, relations, customFields] = await Promise.all([
      this.getEmails(userId),
      this.getPhones(userId),
      this.getAddresses(userId),
      this.getWebsites(userId),
      this.getDates(userId),
      this.getRelations(userId),
      this.getCustomFields(userId)
    ]);
    
    return {
      emails: emails.data || [],
      phones: phones.data || [],
      addresses: addresses.data || [],
      websites: websites.data || [],
      dates: dates.data || [],
      relations: relations.data || [],
      customFields: customFields.data || []
    };
  }
};

export default contactFieldsService;
