import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import rencontreService from '../../services/rencontreService';
import tacheService     from '../../services/tacheService';

export default function DetailRencontre() {
  const { stageId, rencontreId } = useParams();
  const navigate = useNavigate();

  const [rencontre, setRencontre] = useState(null);
  const [taches,    setTaches]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [nouvelleDesc, setNouvelleDesc] = useState('');

  useEffect(() => { refresh(); }, [rencontreId]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        rencontreService.getById(rencontreId),
        tacheService.getByRencontre(rencontreId),
      ]);
      setRencontre(r1.data);
      setTaches(r2.data);
    } catch { alert('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const ajouterTache = async (e) => {
    e.preventDefault();
    try {
      await tacheService.create({
        rencontreId: Number(rencontreId),
        titre:       nouveauTitre,
        description: nouvelleDesc,
      });
      setShowForm(false);
      setNouveauTitre('');
      setNouvelleDesc('');
      refresh();
    } catch { alert('Erreur ajout'); }
  };

  if (loading) return <div style={{ padding:'20px', color:'#64748b' }}>Chargement...</div>;

  const nonValidees = taches.filter(t => t.statut === 'NonValidee');
  const validees    = taches.filter(t => t.statut === 'Validee');

  return (
    <div style={{ maxWidth:'750px', margin:'0 auto', padding:'20px', fontFamily:'Inter, system-ui, sans-serif' }}>

      <button onClick={() => navigate(`/stages/${stageId}/rencontres`)}
        style={{ background:'none', border:'none', color:'#64748b', fontSize:'13px', cursor:'pointer', marginBottom:'12px' }}>
        ← Retour
      </button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:700, color:'#0f172a', margin:'0 0 4px' }}>
            Details de la Rencontre
          </h1>
          <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>
            {new Date(rencontre?.dateRencontre).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}
          </p>
          {rencontre?.description && (
            <p style={{ fontSize:'13px', color:'#475569', marginTop:'6px', fontStyle:'italic' }}>
              {rencontre.description}
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ padding:'8px 16px', backgroundColor:'#0f172a', color:'#fff', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
          + Ajouter une tache
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        <div style={{ backgroundColor:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'10px 16px', fontSize:'12px', color:'#475569' }}>
          <strong>{taches.length}</strong> tache{taches.length !== 1 ? 's' : ''}
        </div>
        <div style={{ backgroundColor:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'6px', padding:'10px 16px', fontSize:'12px', color:'#c2410c' }}>
          <strong>{nonValidees.length}</strong> non validee{nonValidees.length !== 1 ? 's' : ''}
        </div>
        <div style={{ backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', padding:'10px 16px', fontSize:'12px', color:'#15803d' }}>
          <strong>{validees.length}</strong> validee{validees.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des tâches — lecture seule */}
      <div style={{ backgroundColor:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', overflow:'hidden' }}>
        {taches.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>
            Aucune tache pour le moment.
          </div>
        ) : taches.map((t, i) => {
          const isValidee = t.statut === 'Validee';
          return (
            <div key={t.id} style={{
              display:'flex', alignItems:'center', padding:'14px 18px', gap:'14px',
              borderBottom: i < taches.length - 1 ? '1px solid #f1f5f9' : 'none',
              backgroundColor: isValidee ? '#fafafa' : '#fff',
            }}>
              {/* Indicateur */}
              <div style={{
                width:'10px', height:'10px', borderRadius:'50%', flexShrink:0,
                backgroundColor: isValidee ? '#22c55e' : '#f97316',
              }} />
              {/* Contenu */}
              <div style={{ flex:1 }}>
                <div style={{
                  fontWeight:600, fontSize:'13px', color:'#0f172a',
                  textDecoration: isValidee ? 'line-through' : 'none',
                  opacity:        isValidee ? 0.5 : 1,
                }}>
                  {t.titre}
                </div>
                {t.description && (
                  <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'2px' }}>{t.description}</div>
                )}
              </div>
              {/* Badge statut — lecture seule */}
              <span style={{
                fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'10px', flexShrink:0,
                backgroundColor: isValidee ? '#f0fdf4' : '#fff7ed',
                color:           isValidee ? '#15803d' : '#c2410c',
                border:          isValidee ? '1px solid #bbf7d0' : '1px solid #fed7aa',
              }}>
                {isValidee ? 'Validee' : 'Non validee'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal ajout */}
      {showForm && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.45)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', padding:'24px', borderRadius:'10px', width:'380px', boxShadow:'0 10px 30px rgba(0,0,0,0.12)' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'15px', fontWeight:700, color:'#0f172a' }}>Nouvelle Tache</h3>
            <form onSubmit={ajouterTache}>
              <div style={{ marginBottom:'12px' }}>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#475569', marginBottom:'5px' }}>Titre *</label>
                <input value={nouveauTitre} onChange={e => setNouveauTitre(e.target.value)} required autoFocus
                  style={{ width:'100%', padding:'8px 10px', fontSize:'13px', border:'1px solid #e2e8f0', borderRadius:'6px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:'18px' }}>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#475569', marginBottom:'5px' }}>Description (optionnel)</label>
                <textarea value={nouvelleDesc} onChange={e => setNouvelleDesc(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', fontSize:'13px', border:'1px solid #e2e8f0', borderRadius:'6px', outline:'none', resize:'vertical', minHeight:'70px', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'8px' }}>
                <button type="button" onClick={() => { setShowForm(false); setNouveauTitre(''); setNouvelleDesc(''); }}
                  style={{ padding:'7px 16px', fontSize:'13px', border:'1px solid #e2e8f0', borderRadius:'6px', backgroundColor:'#f8fafc', color:'#374151', cursor:'pointer' }}>
                  Annuler
                </button>
                <button type="submit"
                  style={{ padding:'7px 16px', fontSize:'13px', fontWeight:600, border:'none', borderRadius:'6px', backgroundColor:'#0f172a', color:'#fff', cursor:'pointer' }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}