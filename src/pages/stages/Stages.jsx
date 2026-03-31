import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import stageService from '../../services/stageService';


const STATUT_STYLE = {
  Planifie: { color: '#854d0e', bg: '#fefce8', label: 'Planifié' },
  EnCours:  { color: '#2563eb', bg: '#eff6ff', label: 'En cours' },
  Termine:  { color: '#16a34a', bg: '#f0fdf4', label: 'Terminé'  },
};


const btnBase = {
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: '600',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: '0.2s',
  border: '1px solid #cbd5e1',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#fff',
  color: '#334155'
};

const btnBlue = { ...btnBase, backgroundColor: '#2563eb', color: '#fff', border: 'none' };
const btnDelete = { ...btnBase, color: '#ef4444', borderColor: '#fecaca' };


function ModalStagiaires({ isOpen, onClose, stage }) {
  if (!isOpen || !stage) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '95%', maxWidth: '800px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Détails des Stagiaires - {stage.nomGroupe || 'Individuel'}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '24px', color: '#94a3b8' }}>&times;</button>
        </div>
        <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '12px' }}>NOM COMPLET</th>
                <th style={{ padding: '12px' }}>EMAIL</th>
                <th style={{ padding: '12px' }}>ÉTABLISSEMENT</th>
              </tr>
            </thead>
            <tbody>
              {stage.stagiaires?.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{st.nomComplet}</td>
                  <td style={{ padding: '12px', color: '#2563eb' }}>{st.email || '-'}</td>
                  <td style={{ padding: '12px' }}>{st.etablissement?.nom || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '15px 20px', textAlign: 'right', background: '#f8fafc' }}>
          <button onClick={onClose} style={btnBase}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function Stages() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await stageService.getAll();
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(s => 
    !search || (s.nomGroupe || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.sujet?.titre || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '30px', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', maxWidth: '1400px', margin: '0 auto 25px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '700' }}>Gestion des Stages</h1>
        <button onClick={() => navigate('/stages/ajouter')} style={btnBlue}>+ Nouveau Stage</button>
      </div>

      {/* Main Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <input 
          type="text" 
          placeholder="Rechercher par groupe, projet..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '350px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', outline: 'none' }}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>GROUPE</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>PROJET</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>DATES (DÉBUT - FIN)</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>STATUT</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>RESTE</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.map(s => {
                const sc = STATUT_STYLE[s.statut] ?? { color: '#64748b', bg: '#f1f5f9', label: s.statut };
                const today = new Date();
                const daysLeft = s.statut === 'EnCours'
                  ? Math.max(0, Math.round((new Date(s.dateFin) - today) / 86400000))
                  : '-';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}><strong>{s.nomGroupe || 'Individuel'}</strong></td>
                    <td style={{ padding: '15px', color: '#334155' }}>{s.sujet?.titre}</td>
                    <td style={{ padding: '15px', fontSize: '13px' }}>
                      {new Date(s.dateDebut).toLocaleDateString()} - {new Date(s.dateFin).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ color: sc.color, backgroundColor: sc.bg, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: daysLeft !== '-' && daysLeft < 5 ? '#ef4444' : '#475569' }}>
                      {daysLeft} {daysLeft !== '-' ? 'j' : ''}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => navigate(`/stages/${s.id}/rencontres`)} style={btnBase}>Suivi</button>
                        <button onClick={() => { setSelectedStage(s); setShowModal(true); }} style={btnBase}>Stagiaires</button>
                        <button onClick={() => navigate('/stages/ajouter', { state: { editStage: s } })} style={btnBase}>Modifier</button>
                        <button onClick={() => {/* delete */}} style={btnDelete}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalStagiaires isOpen={showModal} onClose={() => setShowModal(false)} stage={selectedStage} />
    </div>
  );
}