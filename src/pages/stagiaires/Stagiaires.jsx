import { useState, useEffect } from 'react';
import stagiaireService from '../../services/stagiaireService';

const styles = {
  container: { padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '25px', overflow: 'hidden' },
  searchInput: { width: '100%', maxWidth: '400px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: '#f8fafc', padding: '12px 15px', textAlign: 'left', color: '#475569', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '15px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', fontSize: '14px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  btnAction: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0', transition: '0.2s', backgroundColor: '#fff' },
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none' },
  btnDanger: { color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fff' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', padding: '0', width: '460px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', overflow: 'hidden' }
};

export default function Stagiaires() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nomComplet: '', email: '', cv: null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const res = await stagiaireService.getAll(); setItems(res.data); }
    catch { setError('Erreur lors du chargement.'); }
    finally { setLoading(false); }
  };

  const openEdit = (item) => { 
    setEditItem(item); 
    setForm({ nomComplet: item.nomComplet, email: item.email, cv: null }); 
    setShowEdit(true); 
  };
  const closeEdit = () => { setShowEdit(false); setEditItem(null); };

  const handleChange = (e) => {
    if (e.target.name === 'cv') setForm({ ...form, cv: e.target.files[0] });
    else setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    try {
      const fd = new FormData();
      fd.append('id', editItem.id);
      fd.append('nomComplet', form.nomComplet);
      fd.append('email', form.email);
      if (editItem.etablissementId) fd.append('etablissementId', editItem.etablissementId);
      if (editItem.filiereId) fd.append('filiereId', editItem.filiereId);
      if (editItem.niveauId) fd.append('niveauId', editItem.niveauId);
      fd.append('stageId', editItem.stageId);
      if (editItem.nomGroupe) fd.append('nomGroupe', editItem.nomGroupe);
      if (form.cv) fd.append('cv', form.cv);
      
      await stagiaireService.update(editItem.id, fd);
      setSuccess('Stagiaire modifié avec succès.'); closeEdit(); loadData();
    } catch { setError('Erreur lors de la sauvegarde.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer هذا المتدرب ؟')) return;
    try { 
      await stagiaireService.delete(id); 
      setItems(items.filter(i => i.id !== id)); 
      setSuccess('Stagiaire supprimé.'); 
    } catch { setError('Erreur suppression.'); }
  };

  const handleViewCv = async (id) => {
    try {
      const res = await stagiaireService.downloadCv(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { setError("Impossible d'afficher le CV."); }
  };

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return item.nomComplet?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s) ||
      item.nomGroupe?.toLowerCase().includes(s) || item.etablissement?.nom?.toLowerCase().includes(s);
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Stagiaires</h1>
          <p style={styles.subtitle}>Gestion et suivi des dossiers des stagiaires</p>
        </div>
      </div>

      {/* Notifications */}
      {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fecaca', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '#bbf7d0 1px solid', fontSize: '14px' }}>{success}</div>}

      <div style={styles.card}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Rechercher (nom, email, établissement...)" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Stagiaire</th>
                <th style={styles.th}>Établissement / Filière</th>
                <th style={styles.th}>Groupe</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Documents</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Chargement en cours...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun stagiaire trouvé.</td></tr>
              ) : filtered.map((item, i) => (
                <tr key={item.id} style={{ transition: '0.2s' }}>
                  <td style={{ ...styles.td, color: '#94a3b8' }}>{i + 1}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.nomComplet}</div>
                    <div style={{ fontSize: '12px', color: '#2563eb' }}>{item.email}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ color: '#475569' }}>{item.etablissement?.nom || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.filiere?.nom || '—'}</div>
                  </td>
                  <td style={styles.td}>
                    {item.nomGroupe ? (
                      <span style={{ ...styles.badge, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>{item.nomGroupe}</span>
                    ) : <span style={{ color: '#cbd5e1' }}>Individuel</span>}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {item.cvPath ? (
                      <button style={styles.btnAction} onClick={() => handleViewCv(item.id)}>Voir CV</button>
                    ) : <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Aucun CV</span>}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{ ...styles.btnAction, color: '#475569' }} onClick={() => openEdit(item)}>Modifier</button>
                      <button style={{ ...styles.btnAction, ...styles.btnDanger }} onClick={() => handleDelete(item.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Section */}
      {showEdit && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Modifier le profil</h3>
              <button onClick={closeEdit} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom Complet *</label>
                <input type="text" name="nomComplet" value={form.nomComplet} onChange={handleChange} style={{ ...styles.searchInput, maxWidth: '100%' }} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email Professionnel *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} style={{ ...styles.searchInput, maxWidth: '100%' }} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nouveau CV (Optionnel - PDF)</label>
                <input type="file" name="cv" accept="application/pdf" onChange={handleChange} style={{ fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" style={styles.btnAction} onClick={closeEdit}>Annuler</button>
                <button type="submit" style={{ ...styles.btnAction, ...styles.btnPrimary, padding: '8px 20px' }}>Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}