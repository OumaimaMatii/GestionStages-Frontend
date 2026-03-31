import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import stageService         from '../../services/stageService';
import stagiaireService     from '../../services/stagiaireService';
import sujetService         from '../../services/sujetService';
import natureStageService   from '../../services/natureStageService';
import dureeService         from '../../services/dureeService';
import etablissementService from '../../services/etablissementService';
import filiereService       from '../../services/filiereService';
import niveauService        from '../../services/niveauService';

export default function AjouterStage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editStage;

  const [sujets,         setSujets]         = useState([]);
  const [natureStages,   setNatureStages]   = useState([]);
  const [durees,         setDurees]         = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [filieres,       setFilieres]       = useState([]);
  const [niveaux,        setNiveaux]        = useState([]);

  const [stageForm, setStageForm] = useState({
    dateDebut: '', dateFin: '', sujetId: '', natureStageId: '', dureeId: '',
    statut: 'Planifie', typeStage: 'Monome', nomGroupe: '',
  });

  const [stagiairesTemp,  setStagiairesTemp]  = useState([]);
  const [stagiairesSuppr, setStagiairesSuppr] = useState([]);
  const [showModal,       setShowModal]       = useState(false);
  const [editIndex,       setEditIndex]       = useState(null);
  const [stagiaireForm, setStagiaireForm] = useState({
    nomComplet: '', email: '', etablissementId: '', filiereId: '', niveauId: '', cv: null
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, n, d, e, f, niv] = await Promise.all([
          sujetService.getActifs(),
          natureStageService.getActifs(),
          dureeService.getActifs(),
          etablissementService.getActifs(),
          filiereService.getActifs(),
          niveauService.getActifs(),
        ]);
        setSujets(s.data); setNatureStages(n.data); setDurees(d.data);
        setEtablissements(e.data); setFilieres(f.data); setNiveaux(niv.data);

        if (editData) {
          setStageForm({
            dateDebut:     editData.dateDebut?.split('T')[0] || '',
            dateFin:       editData.dateFin?.split('T')[0]   || '',
            sujetId:       editData.sujetId      || '',
            natureStageId: editData.natureStageId || '',
            dureeId:       editData.dureeId       || '',
            statut:        editData.statut        || 'Planifie',
            typeStage:     editData.typeStage     || 'Monome',
            nomGroupe:     editData.nomGroupe     || '',
          });
          setStagiairesTemp(editData.stagiaires || []);
        }
      } catch { setError('Erreur chargement des données.'); }
    };
    load();
  }, [editData]);

  const handleStageChange = (e) => {
    const updated = { ...stageForm, [e.target.name]: e.target.value };
    if (e.target.name === 'typeStage' && e.target.value === 'Monome') updated.nomGroupe = '';
    setStageForm(updated);
  };

  const openModal = (index = null) => {
    if (index !== null) {
      setStagiaireForm({ ...stagiairesTemp[index], cv: null });
      setEditIndex(index);
    } else {
      setStagiaireForm({ nomComplet: '', email: '', etablissementId: '', filiereId: '', niveauId: '', cv: null });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditIndex(null); };

  const handleStagiaireChange = (e) => {
    if (e.target.name === 'cv') setStagiaireForm({ ...stagiaireForm, cv: e.target.files[0] });
    else setStagiaireForm({ ...stagiaireForm, [e.target.name]: e.target.value });
  };

  const handleAjouterStagiaire = () => {
    if (!stagiaireForm.nomComplet || !stagiaireForm.email) {
      alert('Nom complet et email obligatoires.'); return;
    }
    if (editIndex !== null) {
      const updated = [...stagiairesTemp];
      updated[editIndex] = { ...stagiaireForm };
      setStagiairesTemp(updated);
    } else {
      setStagiairesTemp(prev => [...prev, { ...stagiaireForm }]);
    }
    closeModal();
  };

  const handleSupprimerStagiaire = (index) => {
    const st = stagiairesTemp[index];
    if (st.id) setStagiairesSuppr(prev => [...prev, st.id]);
    setStagiairesTemp(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stageForm.dateDebut || !stageForm.dateFin)
      return setError('Les dates de début et de fin sont obligatoires.');
    if (new Date(stageForm.dateDebut) >= new Date(stageForm.dateFin))
      return setError('La date de début doit être inférieure à la date de fin.');

    setLoading(true); setError(null);
    try {
      const payload = {
        dateDebut:     stageForm.dateDebut,
        dateFin:       stageForm.dateFin,
        sujetId:       parseInt(stageForm.sujetId),
        natureStageId: parseInt(stageForm.natureStageId),
        dureeId:       parseInt(stageForm.dureeId),
        statut:        stageForm.statut,
        typeStage:     stageForm.typeStage,
        nomGroupe:     stageForm.typeStage === 'Groupe' ? stageForm.nomGroupe : null,
      };

      let stageId;
      if (editData) {
        stageId = editData.id;
        await stageService.update(stageId, { id: stageId, ...payload });
        for (const id of stagiairesSuppr) { await stagiaireService.delete(id).catch(()=>{}); }
      } else {
        const res = await stageService.create(payload);
        stageId = res.data.id;
      }

      for (const st of stagiairesTemp) {
        const fd = new FormData();
        if (st.id) fd.append('id', st.id);
        fd.append('nomComplet', st.nomComplet);
        fd.append('email', st.email);
        fd.append('stageId', stageId);
        if (st.etablissementId) fd.append('etablissementId', st.etablissementId);
        if (st.filiereId)       fd.append('filiereId',       st.filiereId);
        if (st.niveauId)        fd.append('niveauId',        st.niveauId);
        if (st.cv)              fd.append('cv', st.cv);

        if (st.id) await stagiaireService.update(st.id, fd);
        else await stagiaireService.create(fd);
      }

      navigate('/stages');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{editData ? 'Modifier le Stage' : 'Ajouter un Stage'}</div>
          <div className="page-subtitle">{editData ? 'Modifiez les informations du stage' : 'Remplissez le formulaire et ajoutez les stagiaires'}</div>
        </div>
        <button className="btn-edit" onClick={() => navigate('/stages')}>Retour</button>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="table-card p-4 mb-4">
          <div style={{ fontSize:'13px', fontWeight:600, color:'#1e293b', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #f3f4f6' }}>
            Informations du Stage
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Date Debut *</label>
              <input type="date" name="dateDebut" className="form-control" value={stageForm.dateDebut} onChange={handleStageChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date Fin *</label>
              <input type="date" name="dateFin" className="form-control" value={stageForm.dateFin} onChange={handleStageChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Sujet *</label>
              <select name="sujetId" className="form-select" value={stageForm.sujetId} onChange={handleStageChange} required>
                <option value="">-- Selectionner --</option>
                {sujets.map(s => <option key={s.id} value={s.id}>{s.titre}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Nature Stage *</label>
              <select name="natureStageId" className="form-select" value={stageForm.natureStageId} onChange={handleStageChange} required>
                <option value="">-- Selectionner --</option>
                {natureStages.map(n => <option key={n.id} value={n.id}>{n.libelle}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Duree *</label>
              <select name="dureeId" className="form-select" value={stageForm.dureeId} onChange={handleStageChange} required>
                <option value="">-- Selectionner --</option>
                {durees.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Type de Stage *</label>
              <select name="typeStage" className="form-select" value={stageForm.typeStage} onChange={handleStageChange}>
                <option value="Monome">Monome</option>
                <option value="Groupe">Groupe</option>
              </select>
            </div>
            {stageForm.typeStage === 'Groupe' && (
              <div className="col-md-4">
                <label className="form-label">Nom du Groupe *</label>
                <input type="text" name="nomGroupe" className="form-control"
                  placeholder="ex: Groupe A..."
                  value={stageForm.nomGroupe} onChange={handleStageChange} required />
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label">Statut</label>
              <select name="statut" className="form-select" value={stageForm.statut} onChange={handleStageChange}>
                <option value="Planifie">Planifie</option>
                <option value="EnCours">En cours</option>
                <option value="Termine">Termine</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-card p-4 mb-4">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #f3f4f6' }}>
            <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>Stagiaires ({stagiairesTemp.length})</span>
            <button type="button" className="btn-add" onClick={() => openModal()}>+ Ajouter Stagiaire</button>
          </div>
          {stagiairesTemp.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px', color:'#9ca3af', fontSize:'13px', border:'1px dashed #e5e7eb', borderRadius:'4px' }}>Aucun stagiaire</div>
          ) : (
            <table className="table mb-0">
              <thead><tr><th>Nom Complet</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                {stagiairesTemp.map((st, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight:500 }}>{st.nomComplet}</td>
                    <td>{st.email}</td>
                    <td>
                      <button type="button" className="btn-edit me-2" onClick={() => openModal(index)}>Modifier</button>
                      <button type="button" className="btn-delete" onClick={() => handleSupprimerStagiaire(index)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:'12px' }}>
          <button type="button" className="btn-edit" onClick={() => navigate('/stages')}>Annuler</button>
          <button type="submit" className="btn-add" disabled={loading}>
            {loading ? 'Traitement...' : editData ? 'Enregistrer les modifications' : 'Enregistrer le Stage'}
          </button>
        </div>
      </form>

      {showModal && (
        <>
          <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.4)', zIndex:1040 }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', backgroundColor:'#fff', borderRadius:'8px', padding:'28px', width:'540px', zIndex:1050 }}>
            <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'20px' }}>{editIndex !== null ? 'Modifier Stagiaire' : 'Ajouter Stagiaire'}</div>
            <div className="row g-3">
              <div className="col-12"><label className="form-label">Nom Complet *</label>
                <input type="text" name="nomComplet" className="form-control" value={stagiaireForm.nomComplet} onChange={handleStagiaireChange} /></div>
              <div className="col-12"><label className="form-label">Email *</label>
                <input type="email" name="email" className="form-control" value={stagiaireForm.email} onChange={handleStagiaireChange} /></div>
              <div className="col-md-4"><label className="form-label">Etablissement</label>
                <select name="etablissementId" className="form-select" value={stagiaireForm.etablissementId || ''} onChange={handleStagiaireChange}>
                  <option value="">-- Selectionner --</option>
                  {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select></div>
              <div className="col-md-4"><label className="form-label">Filiere</label>
                <select name="filiereId" className="form-select" value={stagiaireForm.filiereId || ''} onChange={handleStagiaireChange}>
                  <option value="">-- Selectionner --</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select></div>
              <div className="col-md-4"><label className="form-label">Niveau</label>
                <select name="niveauId" className="form-select" value={stagiaireForm.niveauId || ''} onChange={handleStagiaireChange}>
                  <option value="">-- Selectionner --</option>
                  {niveaux.map(n => <option key={n.id} value={n.id}>{n.libelle}</option>)}
                </select></div>
              <div className="col-12"><label className="form-label">CV (PDF)</label>
                <input type="file" name="cv" className="form-control" accept="application/pdf" onChange={handleStagiaireChange} /></div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'20px' }}>
              <button type="button" className="btn-edit" onClick={closeModal}>Retour</button>
              <button type="button" className="btn-add" onClick={handleAjouterStagiaire}>OK</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}