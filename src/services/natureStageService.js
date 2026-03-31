import api from '../api/axios';
const natureStageService = {
  getAll:      ()           => api.get('/naturestages'),
  getActifs:   ()           => api.get('/naturestages/actifs'),
  getById:     (id)         => api.get(`/naturestages/${id}`),
  create:      (data)       => api.post('/naturestages', data),
  update:      (id, data)   => api.put(`/naturestages/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/naturestages/${id}/statut?actif=${actif}`),
  delete:      (id)         => api.delete(`/naturestages/${id}`),
};
export default natureStageService;