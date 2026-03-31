import api from '../api/axios';
const stageService = {
  getAll:      ()             => api.get('/stages'),
  getAllService: ()           => api.get('/stages/service-all'),
  getById:     (id)           => api.get(`/stages/${id}`),
  create:      (data)         => api.post('/stages', data),
  update:      (id, data)     => api.put(`/stages/${id}`, data),
  delete:      (id)           => api.delete(`/stages/${id}`),
  patchStatut: (id, statut)   => api.patch(`/stages/${id}/statut?statut=${statut}`),
};
export default stageService;