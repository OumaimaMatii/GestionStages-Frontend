// src/services/themeService.js
import api from '../api/axios';
const themeService = {
  getAll: ()  => api.get('/themes'),
  getActifs:() => api.get('/themes/actifs'),
  getById:(id) => api.get(`/themes/${id}`),
  create:(data)       => api.post('/themes', data),
  update:(id, data)   => api.put(`/themes/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/themes/${id}/statut?actif=${actif}`),
  delete:(id) => api.delete(`/themes/${id}`),
};
export default themeService;