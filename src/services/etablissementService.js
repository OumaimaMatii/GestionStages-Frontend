import api from '../api/axios';
const etablissementService = {
  getAll:      ()           => api.get('/etablissements'),
  getActifs:   ()           => api.get('/etablissements/actifs'),
  getById:     (id)         => api.get(`/etablissements/${id}`),
  create:      (data)       => api.post('/etablissements', data),
  update:      (id, data)   => api.put(`/etablissements/${id}`, data),
  patchStatut: (id, actif)  => api.patch(`/etablissements/${id}/statut?actif=${actif}`),
  delete:      (id)         => api.delete(`/etablissements/${id}`),
};
export default etablissementService;