import { useState, useEffect } from 'react';
import stageService from '../../services/stageService';


const STATUT_STYLE = {
  Planifie: { color: '#854d0e', bg: '#fefce8', label: 'Planifié' },
  EnCours:  { color: '#2563eb', bg: '#eff6ff', label: 'En cours' },
  Termine:  { color: '#16a34a', bg: '#f0fdf4', label: 'Terminé'  },
};

function getStatutAffiche(stage) {
  if (stage.statut === 'Termine') return 'Termine';
  const today = new Date(); today.setHours(0,0,0,0);
  const debut = new Date(stage.dateDebut); debut.setHours(0,0,0,0);
  return debut > today ? 'Planifie' : 'EnCours';
}


const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '30px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  header: { maxWidth: '1400px', margin: '0 auto 25px' },
  title: { margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '25px', maxWidth: '1400px', margin: '0 auto' },
  input: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
  th: { padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
  badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }
};

export default function ServiceStages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await stageService.getAllService();
      setItems(res.data);
    } catch (err) {
      console.error('Erreur API', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(s => {
    const matchesSearch = !search || 
      (s.nomGroupe?.toLowerCase().includes(search.toLowerCase())) ||
      (s.sujet?.titre?.toLowerCase().includes(search.toLowerCase())) ||
      (s.utilisateur?.nomComplet?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatut = !filterStatut || getStatutAffiche(s) === filterStatut;
    return matchesSearch && matchesStatut;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Suivi des Stages du Service</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Consultez et filtrez les stages supervisés par votre service</p>
      </div>

      <div style={styles.card}>
        {/* Filters Section */}
        <div style={{ marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Recherche par groupe, projet ou collaborateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...styles.input, flex: '1', minWidth: '300px' }}
          />

          <select 
            value={filterStatut} 
            onChange={e => setFilterStatut(e.target.value)} 
            style={{ ...styles.input, width: '200px', cursor: 'pointer' }}
          >
            <option value="">Tous les statuts</option>
            <option value="Planifie">Planifié</option>
            <option value="EnCours">En cours</option>
            <option value="Termine">Terminé</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.th}>Groupe</th>
                <th style={styles.th}>Projet / Sujet</th>
                <th style={styles.th}>Collaborateur</th>
                <th style={styles.th}>Période</th>
                <th style={styles.th}>Statut</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Reste</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Chargement des données...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun stage trouvé</td></tr>
              ) : filtered.map(s => {
                const sc = STATUT_STYLE[getStatutAffiche(s)];
                const today = new Date();
                const daysLeft = getStatutAffiche(s) === 'EnCours' 
                  ? Math.max(0, Math.round((new Date(s.dateFin) - today) / 86400000)) 
                  : '-';

                return (
                  <tr key={s.id} style={{ transition: 'background 0.2s' }}>
                    <td style={styles.td}><strong>{s.nomGroupe || 'Individuel'}</strong></td>
                    <td style={{ ...styles.td, color: '#334155' }}>{s.sujet?.titre}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500' }}>{s.utilisateur?.nomComplet || '-'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Encadrant</div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(s.dateDebut).toLocaleDateString()} - {new Date(s.dateFin).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, color: sc.color, backgroundColor: sc.bg }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: '700', color: daysLeft < 5 && daysLeft !== '-' ? '#ef4444' : '#475569' }}>
                      {daysLeft} {daysLeft !== '-' ? 'j' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}