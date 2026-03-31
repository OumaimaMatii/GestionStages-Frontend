import api from '../api/axios';
const filiereService = {
  getAll:      ()           => api.get('/filieres'),
  getActifs:   ()           => api.get('/filieres/actifs'),
  getById:     (id)         => api.get(`/filieres/${id}`),
  create:      (data)       => api.post('/filieres', data),
  update:      (id, data)   => api.put(`/filieres/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/filieres/${id}/statut?actif=${actif}`),
  delete:      (id)         => api.delete(`/filieres/${id}`),
};
export default filiereService;