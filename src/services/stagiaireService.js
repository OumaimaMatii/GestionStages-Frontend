import api from '../api/axios';
const stagiaireService = {
  getAll:     ()          => api.get('/stagiaires'),
  getById:    (id)        => api.get(`/stagiaires/${id}`),
  create:     (formData)  => api.post('/stagiaires', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id, fd)    => api.put(`/stagiaires/${id}`, fd,  { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadCv: (id)        => api.get(`/stagiaires/${id}/cv`, { responseType: 'blob' }),
  delete:     (id)        => api.delete(`/stagiaires/${id}`),
};
export default stagiaireService;