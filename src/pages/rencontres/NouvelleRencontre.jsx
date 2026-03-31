import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import rencontreService from '../../services/rencontreService';
import tacheService     from '../../services/tacheService';
import stageService     from '../../services/stageService';

export default function NouvelleRencontre() {
  const { stageId } = useParams();
  const navigate    = useNavigate();

  const [stage,       setStage]       = useState(null);
  const [initData,    setInitData]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [tachesPrec,  setTachesPrec]  = useState([]);
  const [nouvelles,   setNouvelles]   = useState([]);
  const [error,       setError]       = useState('');

  // Champ pour ajouter une tâche via bouton submit
  const [nouvelleTitre, setNouvelleTitre]       = useState('');
  const [nouvelleDesc,  setNouvelleDesc]         = useState('');
  const [showFormTache, setShowFormTache]        = useState(false);

  useEffect(() => {
    const chargerInfos = async () => {
      try {
        const [resStage, resInit] = await Promise.all([
          stageService.getById(stageId),
          rencontreService.initNouvelle(stageId),
        ]);
        setStage(resStage.data);
        setInitData(resInit.data);
        // Garder uniquement les tâches NonValidee — les Validee ne s'affichent pas
        setTachesPrec((resInit.data.tachesNonTerminees || [])
          .filter(item => (item.statut || 'NonValidee') === 'NonValidee')
          .map(item => ({
            ...item,
            statutLocal: 'NonValidee',
            modifie:     false,
          })));
      } catch { setError('Erreur lors du chargement des informations.'); }
      finally { setLoading(false); }
    };
    chargerInfos();
  }, [stageId]);

  const modifierStatutPrec = (index, nouveau) => {
    setTachesPrec(prev => prev.map((t, i) =>
      i === index ? { ...t, statutLocal: nouveau, modifie: true } : t
    ));
  };

  // Ajouter une tâche via le bouton submit du mini-formulaire
  const handleAjouterTache = (e) => {
    e.preventDefault();
    if (!nouvelleTitre.trim()) return;
    setNouvelles(prev => [...prev, { titre: nouvelleTitre.trim(), description: nouvelleDesc.trim() }]);
    setNouvelleTitre('');
    setNouvelleDesc('');
    setShowFormTache(false);
  };

  const supprimerNouvelle = (index) => {
    setNouvelles(prev => prev.filter((_, i) => i !== index));
  };

  const validerEtCreer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Sauvegarder statuts modifiés
      for (const t of tachesPrec) {
        if (t.statutLocal !== t.statut) {
          await tacheService.patchStatut(t.id, t.statutLocal);
        }
      }

      // 2. Créer la rencontre
      const res = await rencontreService.create(
        { stageId: Number(stageId), dateRencontre: date, description },
        initData?.derniereRencontreId
      );

      // 3. Ajouter les nouvelles tâches
      for (const nt of nouvelles) {
        if (nt.titre.trim()) {
          await rencontreService.ajouterTache(res.data.id, {
            titre: nt.titre, description: nt.description,
          });
        }
      }

      navigate(`/stages/${stageId}/rencontres`);
    } catch { setError('Une erreur est survenue pendant la creation.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:'30px', color:'#64748b' }}>Chargement en cours...</div>;

  const inp  = { padding:'8px 10px', fontSize:'13px', border:'1px solid #e2e8f0', borderRadius:'6px', outline:'none', boxSizing:'border-box', width:'100%' };
  const card = { border:'1px solid #e2e8f0', padding:'20px', borderRadius:'8px', marginBottom:'20px', backgroundColor:'#fff' };

  // Liste unifiée : seulement les NonValidee + nouvelles tâches
  // N'afficher que les tâches que l'utilisateur a explicitement marquées 'Reporter'
  const tachesAReporter = tachesPrec.filter(t => t.modifie && t.statutLocal === 'NonValidee');
  const totalListe      = tachesAReporter.length + nouvelles.length;

  return (
    <div style={{ maxWidth:'750px', margin:'0 auto', padding:'20px', fontFamily:'Inter, system-ui, sans-serif' }}>

      <button onClick={() => navigate(`/stages/${stageId}/rencontres`)}
        style={{ background:'none', border:'none', color:'#64748b', fontSize:'13px', cursor:'pointer', marginBottom:'12px' }}>
        ← Retour
      </button>

      <h2 style={{ margin:'0 0 4px', fontSize:'20px', fontWeight:700, color:'#0f172a' }}>
        Nouvelle Rencontre n°{initData?.numeroRencontre}
      </h2>
      <p style={{ color:'#64748b', marginBottom:'24px', fontSize:'13px' }}>{stage?.sujet?.titre}</p>

      {error && (
        <div style={{ color:'#be123c', padding:'10px 14px', border:'1px solid #fecaca', backgroundColor:'#fff1f2', borderRadius:'6px', marginBottom:'16px', fontSize:'13px' }}>
          {error}
        </div>
      )}

      <form onSubmit={validerEtCreer}>

        {/* ── Infos de base ── */}
        <div style={card}>
          <div style={{ fontWeight:600, fontSize:'13px', color:'#374151', marginBottom:'14px' }}>Informations</div>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontWeight:600, fontSize:'12px', color:'#475569', marginBottom:'5px' }}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
              style={{ ...inp, width:'180px' }} />
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'12px', color:'#475569', marginBottom:'5px' }}>Notes / Resume</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Resume de la rencontre..."
              style={{ ...inp, height:'80px', resize:'vertical' }} />
          </div>
        </div>

        {/* ── Tâches précédentes : 2 boutons ── */}
        {tachesPrec.length > 0 && (
          <div style={{ ...card, border:'1px solid #fde68a', backgroundColor:'#fffdf5' }}>
            <div style={{ fontWeight:600, fontSize:'13px', color:'#374151', marginBottom:'4px' }}>
              Taches de la rencontre precedente
            </div>
            <p style={{ fontSize:'12px', color:'#92400e', marginBottom:'16px' }}>
              Validez les taches terminees. Les autres seront reportees dans cette rencontre.
            </p>

            {tachesPrec.map((t, i) => (
              <div key={t.id} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 0', borderBottom:'1px solid #f3f4f6', gap:'12px',
              }}>
                <div style={{ flex:1 }}>
                  <div style={{
                    fontWeight:500, fontSize:'13px', color:'#0f172a',
                    textDecoration: t.statutLocal === 'Validee' ? 'line-through' : 'none',
                    opacity:        t.statutLocal === 'Validee' ? 0.45 : 1,
                  }}>
                    {t.titre}
                  </div>
                  {t.description && (
                    <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>{t.description}</div>
                  )}
                </div>

                {/* 2 boutons */}
                <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                  <button type="button" onClick={() => modifierStatutPrec(i, 'Validee')}
                    style={{
                      padding:'5px 12px', fontSize:'12px', fontWeight:600, borderRadius:'6px', cursor:'pointer',
                      border:          t.statutLocal === 'Validee' ? '2px solid #22c55e' : '1.5px solid #d1d5db',
                      backgroundColor: t.statutLocal === 'Validee' ? '#22c55e' : '#fff',
                      color:           t.statutLocal === 'Validee' ? '#fff' : '#6b7280',
                    }}>
                    ✓ Validee
                  </button>
                  <button type="button" onClick={() => modifierStatutPrec(i, 'NonValidee')}
                    style={{
                      padding:'5px 12px', fontSize:'12px', fontWeight:600, borderRadius:'6px', cursor:'pointer',
                      border:          t.statutLocal === 'NonValidee' ? '2px solid #f97316' : '1.5px solid #d1d5db',
                      backgroundColor: t.statutLocal === 'NonValidee' ? '#f97316' : '#fff',
                      color:           t.statutLocal === 'NonValidee' ? '#fff' : '#6b7280',
                    }}>
                    ⟲ Reporter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Liste unifiée : tâches à reporter + nouvelles ── */}
        <div style={{ ...card, border:'1px solid #bfdbfe', backgroundColor:'#f0f7ff' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
            <div style={{ fontWeight:600, fontSize:'13px', color:'#1d4ed8' }}>
              Taches de cette rencontre
              {totalListe > 0 && (
                <span style={{ marginLeft:'8px', fontSize:'11px', backgroundColor:'#dbeafe', color:'#1d4ed8', border:'1px solid #bfdbfe', padding:'1px 8px', borderRadius:'10px' }}>
                  {totalListe}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize:'12px', color:'#3b82f6', marginBottom:'16px' }}>
            Ces taches seront envoyees par email aux stagiaires.
          </p>

          {/* Tâches reportées (NonValidee) */}
          {tachesAReporter.map(t => (
            <div key={t.id} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 12px', marginBottom:'6px',
              border:'1px solid #fed7aa', borderLeft:'4px solid #f97316',
              borderRadius:'7px', backgroundColor:'#fff7ed',
            }}>
              <span style={{ fontSize:'13px' }}>⟲</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500, fontSize:'13px', color:'#0f172a' }}>{t.titre}</div>
                {t.description && <div style={{ fontSize:'12px', color:'#9ca3af' }}>{t.description}</div>}
              </div>
              <span style={{ fontSize:'11px', color:'#c2410c', backgroundColor:'#fff7ed', border:'1px solid #fed7aa', padding:'1px 7px', borderRadius:'10px', flexShrink:0 }}>
                Reportee
              </span>
            </div>
          ))}

          {/* Nouvelles tâches ajoutées */}
          {nouvelles.map((t, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 12px', marginBottom:'6px',
              border:'1px solid #bfdbfe', borderLeft:'4px solid #3b82f6',
              borderRadius:'7px', backgroundColor:'#eff6ff',
            }}>
              <span style={{ fontSize:'13px' }}>+</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500, fontSize:'13px', color:'#0f172a' }}>{t.titre}</div>
                {t.description && <div style={{ fontSize:'12px', color:'#9ca3af' }}>{t.description}</div>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <span style={{ fontSize:'11px', color:'#1d4ed8', backgroundColor:'#dbeafe', border:'1px solid #bfdbfe', padding:'1px 7px', borderRadius:'10px' }}>
                  Nouvelle
                </span>
                <button type="button" onClick={() => supprimerNouvelle(i)}
                  style={{ background:'none', border:'none', color:'#be123c', cursor:'pointer', fontSize:'16px', lineHeight:1, padding:'0 2px' }}>
                  ×
                </button>
              </div>
            </div>
          ))}

          {totalListe === 0 && (
            <div style={{ textAlign:'center', padding:'18px', border:'1px dashed #bfdbfe', borderRadius:'8px', color:'#93c5fd', fontSize:'13px', marginBottom:'10px' }}>
              Aucune tache pour cette rencontre.
            </div>
          )}

          {/* ── Mini-formulaire ajout tâche ── */}
          {showFormTache ? (
            <div style={{ marginTop:'14px', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'14px', backgroundColor:'#fff' }}>
              <div style={{ fontWeight:600, fontSize:'12px', color:'#374151', marginBottom:'10px' }}>Nouvelle tache</div>
              <input placeholder="Titre *" value={nouvelleTitre}
                onChange={e => setNouvelleTitre(e.target.value)}
                style={{ ...inp, marginBottom:'8px' }}
                autoFocus />
              <textarea placeholder="Description (optionnel)" value={nouvelleDesc}
                onChange={e => setNouvelleDesc(e.target.value)}
                style={{ ...inp, resize:'vertical', minHeight:'55px', marginBottom:'12px' }} />
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowFormTache(false); setNouvelleTitre(''); setNouvelleDesc(''); }}
                  style={{ padding:'6px 14px', fontSize:'12px', border:'1px solid #e2e8f0', borderRadius:'6px', backgroundColor:'#f8fafc', color:'#374151', cursor:'pointer' }}>
                  Annuler
                </button>
                <button type="button" onClick={handleAjouterTache}
                  disabled={!nouvelleTitre.trim()}
                  style={{
                    padding:'6px 14px', fontSize:'12px', fontWeight:600, borderRadius:'6px', cursor: nouvelleTitre.trim() ? 'pointer' : 'not-allowed',
                    border:'none', backgroundColor: nouvelleTitre.trim() ? '#0f172a' : '#cbd5e1', color:'#fff',
                  }}>
                  Ajouter
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowFormTache(true)}
              style={{ marginTop:'10px', padding:'7px 14px', border:'1px dashed #93c5fd', backgroundColor:'#fff', color:'#1d4ed8', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:600 }}>
               Ajouter une tache
            </button>
          )}
        </div>

        {/* ── Submit principal ── */}
        <div style={{ textAlign:'right' }}>
          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background: saving ? '#64748b' : '#0f172a', color:'#fff', border:'none', borderRadius:'6px', cursor: saving ? 'not-allowed' : 'pointer', fontSize:'13px', fontWeight:600 }}>
            {saving ? 'Enregistrement...' : 'Creer la rencontre'}
          </button>
        </div>

      </form>
    </div>
  );
}