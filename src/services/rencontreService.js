import api from '../api/axios';

const rencontreService = {
  getByStage:   (stageId) => api.get(`/rencontres/stage/${stageId}`),
  getById:      (id)      => api.get(`/rencontres/${id}`),
  initNouvelle: (stageId) => api.get(`/rencontres/stage/${stageId}/init-nouvelle`),


  create: (data, derniereRencontreId) => {
    const idNum = derniereRencontreId && !isNaN(Number(derniereRencontreId))
      ? Number(derniereRencontreId)
      : null;
    const params = idNum ? `?derniereRencontreId=${idNum}` : '';
    return api.post(`/rencontres${params}`, {
      stageId:       Number(data.stageId),
      dateRencontre: data.dateRencontre,
      description:   data.description || null,
    });
  },
ajouterTache: (rencontreId, tache) =>
    api.post(`/rencontres/${rencontreId}/taches`, {
      titre:       tache.titre,
      description: tache.description || null,}),
  update: (id, data) => api.put(`/rencontres/${id}`, data),
  delete: (id)       => api.delete(`/rencontres/${id}`),
};

export default rencontreService;