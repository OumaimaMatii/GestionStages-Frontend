import api from '../api/axios';

const tacheService = {
 
  getByRencontre: (rencontreId) => api.get(`/taches/rencontre/${rencontreId}`),

  
  getById:(id)=> api.get(`/taches/${id}`),

  create:(data) => api.post('/taches', data),

  update:(id, data)=> api.put(`/taches/${id}`, data),

  patchStatut:(id, statut)=> api.patch(`/taches/${id}/statut?statut=${statut}`),

  delete:(id) => api.delete(`/taches/${id}`),
};

export default tacheService;