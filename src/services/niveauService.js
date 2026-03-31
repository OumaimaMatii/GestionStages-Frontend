import api from '../api/axios';
const niveauService = {
  getAll:      ()           => api.get('/niveaux'),
  getActifs:   ()           => api.get('/niveaux/actifs'),
  getById:     (id)         => api.get(`/niveaux/${id}`),
  create:      (data)       => api.post('/niveaux', data),
  update:      (id, data)   => api.put(`/niveaux/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/niveaux/${id}/statut?actif=${actif}`),
  delete:      (id)         => api.delete(`/niveaux/${id}`),
};
export default niveauService;