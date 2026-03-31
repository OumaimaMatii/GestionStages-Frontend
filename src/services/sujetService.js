import api from '../api/axios';

const sujetService = {
  getAll:    () => api.get('/sujets'),
  getActifs: () => api.get('/sujets/actifs'),
  getById:   (id) => api.get(`/sujets/${id}`),

  create: (formData) => api.post('/sujets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  update: (id, formData) => api.put(`/sujets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  patchStatut: (id, actif) => api.patch(`/sujets/${id}/statut?actif=${actif}`),

  delete: (id) => api.delete(`/sujets/${id}`),

  // Télécharger le document en blob (PDF)
  getDocument: (id) => api.get(`/sujets/${id}/document`, {
    responseType: 'blob',
  }),
};

export default sujetService;