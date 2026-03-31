import api from '../api/axios';
const dureeService = {
  getAll:      ()           => api.get('/durees'),
  getActifs:   ()           => api.get('/durees/actifs'),
  getById:     (id)         => api.get(`/durees/${id}`),
  create:      (data)       => api.post('/durees', data),
  update:      (id, data)   => api.put(`/durees/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/durees/${id}/statut?actif=${actif}`),
  delete:      (id)         => api.delete(`/durees/${id}`),
};
export default dureeService;