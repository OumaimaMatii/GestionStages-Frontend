// src/pages/referentiels/Services.jsx
import { useState, useEffect, useRef } from 'react';
import serviceService from '../../services/serviceService';
import api            from '../../api/axios';
import s              from '../../styles/tableStyles';

export default function Services() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [alert,     setAlert]     = useState({ type: '', msg: '' });
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [formVal,   setFormVal]   = useState('');
  const inputRef                  = useRef(null);
  const [loadExcel, setLoadExcel] = useState(false);

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await serviceService.getAll(); setItems(r.data || []); }
    catch { flash('danger', 'Erreur chargement.'); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(it =>
    it.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item = null) => {
    setEditItem(item);
    setFormVal(item ? item.nom : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formVal.trim()) return flash('danger', 'Le nom du service est requis.');
    try {
      if (editItem) {
        await serviceService.update(editItem.id, { ...editItem, nom: formVal.trim() });
        flash('success', 'Service modifié avec succès.');
      } else {
        await serviceService.create({ nom: formVal.trim() });
        flash('success', 'Nouveau service créé.');
      }
      setShowModal(false); load();
    } catch { flash('danger', "Erreur lors de l'opération."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ? Attention, cela peut impacter les stages associés.')) return;
    try { await serviceService.delete(id); flash('success', 'Service supprimé.'); load(); }
    catch (err) { flash('danger', err.response?.data?.message || 'Erreur suppression.'); }
  };

  const handleFichierExcel = async (e) => {
    const file = e.target.files[0]; if (!file) return; e.target.value = '';
    const fd = new FormData(); fd.append('file', file);
    setLoadExcel(true);
    try {
      const res = await api.post('/import/services', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      flash('success', res.data.message); load();
    } catch (err) { flash('danger', err.response?.data?.message || "Erreur import."); }
    finally { setLoadExcel(false); }
  };

  return (
    <div style={s.container}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Services</h1>
          <p style={s.subtitle}>Gestion des départements et services</p>
        </div>
        <div style={s.headerBtns}>
          <input type="file" accept=".xlsx" ref={inputRef}
            onChange={handleFichierExcel} style={{ display: 'none' }} />
          <button
            style={{ ...s.btnGreen, opacity: loadExcel ? 0.7 : 1 }}
            onClick={() => inputRef.current.click()}
            disabled={loadExcel}
          >
            {loadExcel ? 'Import...' : '⬆ Importer Excel'}
          </button>
          <button style={s.btnBlue} onClick={() => openModal()}>
            + Ajouter un service
          </button>
        </div>
      </div>

      {/* ── Notification ── */}
      {alert.msg && (
        <div style={{
          ...s.alertBase,
          ...(alert.type === 'success' ? s.alertSuccess : s.alertDanger),
        }}>
          {alert.msg}
        </div>
      )}

      {/* ── Card ── */}
      <div style={s.card}>

        {/* Recherche */}
        <div style={{ marginBottom: '25px', position: 'relative' }}>
          <input
            style={{
              padding: '10px 15px 10px 16px', borderRadius: '8px',
              border: '1px solid #e2e8f0', width: '300px', fontSize: '14px',
              outline: 'none', backgroundColor: '#f8fafc',
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un service..."
          />
        </div>

        {/* Tableau */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nom du Service</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun service trouvé</td></tr>
              ) : filtered.map(it => (
                <tr key={it.id}>
                  <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>{it.nom}</td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={s.btnAction} onClick={() => openModal(it)}>Modifier</button>
                      <button style={{ ...s.btnAction, ...s.btnDelete }} onClick={() => handleDelete(it.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                {editItem ? 'Modifier le service' : 'Ajouter un service'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalForm}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Nom du service *
                </label>
                <input
                  style={{ ...s.input, width: '100%', boxSizing: 'border-box' }}
                  value={formVal}
                  onChange={e => setFormVal(e.target.value)}
                  placeholder="Ex: Direction SI"
                  autoFocus required
                />
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnAction} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btnAction, ...s.btnBlue }}>
                  {editItem ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}