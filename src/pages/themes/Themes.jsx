import { useState, useEffect } from 'react';
import themeService from '../../services/themeService';

const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '30px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  header: { maxWidth: '1400px', margin: '0 auto 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '25px', maxWidth: '1400px', margin: '0 auto' },
  input: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
  th: { padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
  btnBlue: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  btnAction: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: '#fff', transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  btnDelete: { color: '#ef4444', borderColor: '#fecaca' },
  btnToggle: { fontSize: '11px', padding: '4px 8px' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', width: '450px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', overflow: 'hidden' }
};

export default function Themes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [filtre, setFiltre] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formVal, setFormVal] = useState('');

  const flash = (type, msg) => { 
    setAlert({ type, msg }); 
    setTimeout(() => setAlert({ type: '', msg: '' }), 3000); 
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await themeService.getAll(); setItems(r.data); }
    catch { flash('danger', 'Erreur chargement.'); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(it => {
    if (filtre === 'actifs') return it.actif;
    if (filtre === 'inactifs') return !it.actif;
    return true;
  });

  const openModal = (item = null) => {
    setEditItem(item);
    setFormVal(item ? item.nom : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await themeService.update(editItem.id, { ...editItem, nom: formVal.trim() });
        flash('success', 'Thème modifié.');
      } else {
        await themeService.create({ nom: formVal.trim() });
        flash('success', 'Thème ajouté.');
      }
      setShowModal(false); load();
    } catch { flash('danger', 'Erreur lors de la sauvegarde.'); }
  };

  const toggleStatut = async (it) => {
    try {
      await themeService.patchStatut(it.id, !it.actif);
      setItems(prev => prev.map(s => s.id === it.id ? { ...s, actif: !s.actif } : s));
      flash('success', 'Statut mis à jour.');
    } catch { flash('danger', 'Erreur statut.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce thème ?')) return;
    try { await themeService.delete(id); flash('success', 'Thème supprimé.'); load(); }
    catch { flash('danger', 'Erreur suppression.'); }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des Thèmes</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Définissez les catégories de stages disponibles</p>
        </div>
        <button style={styles.btnBlue} onClick={() => openModal()}>+ Nouveau Thème</button>
      </div>

      {/* Alert Message */}
      {alert.msg && (
        <div style={{
          backgroundColor: alert.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: alert.type === 'success' ? '#16a34a' : '#dc2626',
          border: '1px solid',
          borderColor: alert.type === 'success' ? '#bbf7d0' : '#fecaca',
          padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '1400px', margin: '0 auto 20px'
        }}>{alert.msg}</div>
      )}

      <div style={styles.card}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          {[['tous', 'Tous'], ['actifs', 'Actifs'], ['inactifs', 'Inactifs']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltre(val)} style={{
              ...styles.btnAction,
              backgroundColor: filtre === val ? '#eff6ff' : '#fff',
              color: filtre === val ? '#2563eb' : '#64748b',
              borderColor: filtre === val ? '#bfdbfe' : '#e2e8f0',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.th}>Nom du Thème</th>
                <th style={styles.th}>Statut</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun thème trouvé</td></tr>
              ) : filtered.map((it) => (
                <tr key={it.id}>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>{it.nom}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      ...styles.badge, 
                      backgroundColor: it.actif ? '#f0fdf4' : '#f9fafb', 
                      color: it.actif ? '#15803d' : '#6b7280' 
                    }}>
                      {it.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{ ...styles.btnAction, ...styles.btnToggle }} onClick={() => toggleStatut(it)}>
                        {it.actif ? 'Désactiver' : 'Activer'}
                      </button>
                      <button style={styles.btnAction} onClick={() => openModal(it)}>Modifier</button>
                      <button style={{ ...styles.btnAction, ...styles.btnDelete }} onClick={() => handleDelete(it.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{editItem ? 'Modifier le Thème' : 'Nouveau Thème'}</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Nom du thème *</label>
                <input style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} value={formVal} onChange={e => setFormVal(e.target.value)} autoFocus required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" style={styles.btnAction} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" style={{ ...styles.btnAction, ...styles.btnBlue }}>{editItem ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}