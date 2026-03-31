
import api from '../api/axios';

const utilisateurService = {
  getAll:         () => api.get('/utilisateurs'),
  getNonVerifies: () => api.get('/utilisateurs/non-verifies'),

  create: (email, password, nomComplet, serviceId, role, isVerified) =>
    api.post(`/utilisateurs?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&nomComplet=${encodeURIComponent(nomComplet)}&serviceId=${serviceId || ''}&role=${role}&isVerified=${isVerified}`),

  modifier: (id, nomComplet, role, serviceId) =>
    api.put(`/utilisateurs/${id}/modifier?nomComplet=${encodeURIComponent(nomComplet)}&role=${role}&serviceId=${serviceId || ''}`),

  verifierEtRole: (id, role) =>
    api.put(`/utilisateurs/${id}/verifier-et-role?role=${role}`),

  delete: (id) => api.delete(`/utilisateurs/${id}`),
};

export default utilisateurService;