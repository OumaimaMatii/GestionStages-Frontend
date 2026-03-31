import { useState, useEffect } from 'react';
import sujetService from '../../services/sujetService';
import themeService from '../../services/themeService';

const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '30px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  header: { maxWidth: '1400px', margin: '0 auto 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: (2026, '12px'), boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '25px', maxWidth: '1400px', margin: '0 auto' },
  input: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
  th: { padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
  btnBlue: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  btnAction: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: '#fff', transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  btnDelete: { color: '#ef4444', borderColor: '#fecaca' },
  btnToggle: { fontSize: '11px', padding: '4px 8px' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', width: '500px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', overflow: 'hidden' }
};

export default function Sujets() {
  const [items, setItems] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ titre: '', description: '', themeId: '', document: null });
  const [openingDoc, setOpeningDoc] = useState(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, th] = await Promise.all([sujetService.getAll(), themeService.getAll()]);
      setItems(s.data || []);
      setThemes(th.data || []);
    } catch { setError('Erreur lors du chargement.'); }
    finally { setLoading(false); }
  };

  const openEdit = (item = null) => {
    setEditItem(item);
    setForm({ titre: item?.titre || '', description: item?.description || '', themeId: String(item?.themeId || ''), document: null });
    setShowEdit(true);
  };

  const closeEdit = () => { setShowEdit(false); setEditItem(null); setForm({ titre: '', description: '', themeId: '', document: null }); };

  const handleChange = e => {
    if (e.target.name === 'document') setForm({ ...form, document: e.target.files[0] });
    else setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('titre', form.titre.trim());
    fd.append('description', form.description || '');
    fd.append('themeId', form.themeId);
    if (form.document) fd.append('document', form.document);

    try {
      if (editItem?.id) {
        fd.append('id', editItem.id);
        await sujetService.update(editItem.id, fd);
        setSuccess('Sujet modifié.');
        closeEdit(); loadData();
      } else {
        const res = await sujetService.create(fd);
        setSuccess('Sujet ajouté.');
        closeEdit(); setItems(prev => [res.data, ...prev]);
      }
    } catch { setError('Erreur de sauvegarde.'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce sujet ?')) return;
    try {
      await sujetService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setSuccess('Sujet supprimé.');
    } catch { setError('Erreur suppression.'); }
  };

  const handleToggleStatut = async (it) => {
    try {
      await sujetService.patchStatut(it.id, !it.actif);
      setItems(prev => prev.map(s => s.id === it.id ? { ...s, actif: !s.actif } : s));
    } catch { setError('Erreur statut.'); }
  };

  const handleViewDocument = async (item) => {
    if (!item.documentPath) return;
    setOpeningDoc(item.id);
    try {
      const res = await sujetService.getDocument(item.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { setError('Erreur document.'); }
    finally { setOpeningDoc(null); }
  };

  const filtered = items.filter(it => !search || it.titre?.toLowerCase().includes(search.toLowerCase()) || it.theme?.nom?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sujets de Stage</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Gestion de la bibliothèque des sujets</p>
        </div>
        <button style={styles.btnBlue} onClick={() => openEdit()}>+ Nouveau Sujet</button>
      </div>

      <div style={styles.card}>
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...styles.input, width: '100%', maxWidth: '400px', marginBottom: '20px' }} />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.th}>Titre du Sujet</th>
                <th style={styles.th}>Thème</th>
                <th style={styles.th}>Document</th>
                <th style={styles.th}>Statut</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.map((it) => (
                <tr key={it.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{it.titre}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{it.description?.substring(0, 50)}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>{it.theme?.nom || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    {it.documentPath ? (
                      <button onClick={() => handleViewDocument(it)} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                        {openingDoc === it.id ? '...' : 'PDF'}
                      </button>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: it.actif ? '#f0fdf4' : '#f9fafb', color: it.actif ? '#15803d' : '#6b7280' }}>
                      {it.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{ ...styles.btnAction, ...styles.btnToggle }} onClick={() => handleToggleStatut(it)}>
                        {it.actif ? 'Désactiver' : 'Activer'}
                      </button>
                      <button style={styles.btnAction} onClick={() => openEdit(it)}>Modifier</button>
                      <button style={{ ...styles.btnAction, ...styles.btnDelete }} onClick={() => handleDelete(it.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEdit && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{editItem ? 'Modifier' : 'Nouveau'}</h3>
              <button onClick={closeEdit} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Titre *</label>
                <input type="text" name="titre" value={form.titre} onChange={handleChange} style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Thème *</label>
                <select name="themeId" value={form.themeId} onChange={handleChange} style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} required>
                  <option value="">Sélectionner</option>
                  {themes.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} style={{ ...styles.input, width: '100%', height: '70px', boxSizing: 'border-box', resize: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Document (PDF)</label>
                <input type="file" name="document" accept="application/pdf" onChange={handleChange} style={{ fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" style={styles.btnAction} onClick={closeEdit}>Annuler</button>
                <button type="submit" style={{ ...styles.btnAction, ...styles.btnBlue }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}