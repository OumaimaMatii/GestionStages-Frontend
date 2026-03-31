import { useState, useEffect } from 'react';
import s from '../styles/tableStyles';
import useImportExcel from '../hooks/useImportExcel';
import { filtrerParStatut } from '../utils/filtrage';

export default function TableLookup({
  titre,
  sousTitre,
  colLabel,
  champAffichage,
  champForm,
  labelAjouter,
  labelModal,
  labelChamp,
  importEndpoint,
  service,
}) {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [alert,     setAlert]     = useState({ type: '', msg: '' });
  const [filtre,    setFiltre]    = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [formVal,   setFormVal]   = useState('');

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try { const r = await service.getAll(); setItems(r.data || []); }
    catch { flash('danger', 'Erreur chargement.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);


  const { inputRef, handleFichier, ouvrirExplorateur, loadExcel } =
    useImportExcel(importEndpoint, load, flash);

  const filtered = filtrerParStatut(items, filtre);

  const openModal = (item = null) => {
    setEditItem(item);
    setFormVal(item ? (item[champForm] ?? item[champAffichage] ?? '') : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formVal.trim()) return flash('danger', 'Champ requis.');
    try {
      if (editItem) {
        await service.update(editItem.id, { ...editItem, [champForm]: formVal.trim() });
        flash('success', 'Élément modifié.');
      } else {
        await service.create({ [champForm]: formVal.trim() });
        flash('success', 'Élément ajouté.');
      }
      setShowModal(false);
      load();
    } catch { flash('danger', 'Erreur de sauvegarde.'); }
  };

  const toggleStatut = async (it) => {
    try {
      await service.patchStatut(it.id, !it.actif);
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, actif: !x.actif } : x));
      flash('success', 'Statut mis à jour.');
    } catch { flash('danger', 'Erreur statut.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try { await service.delete(id); flash('success', 'Suppression effectuée.'); load(); }
    catch { flash('danger', 'Erreur suppression.'); }
  };

  return (
    <div style={s.container}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{titre}</h1>
          <p style={s.subtitle}>{sousTitre}</p>
        </div>
        <div style={s.headerBtns}>

          {/* Input caché directement ici — JSX interdit dans un hook .js */}
          <input
            type="file"
            accept=".xlsx"
            ref={inputRef}
            onChange={handleFichier}
            style={{ display: 'none' }}
          />

          <button
            style={{ ...s.btnGreen, opacity: loadExcel ? 0.7 : 1 }}
            onClick={ouvrirExplorateur}
            disabled={loadExcel}
          >
            {loadExcel ? 'Import...' : '⬆ Importer Excel'}
          </button>

          <button style={s.btnBlue} onClick={() => openModal()}>
            {labelAjouter}
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

        {/* Filtres */}
        <div style={s.filtreBtns}>
          {[['tous', 'Tous'], ['actifs', 'Actifs'], ['inactifs', 'Inactifs']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltre(val)} style={{
              ...s.btnAction,
              backgroundColor: filtre === val ? '#eff6ff' : '#fff',
              color:           filtre === val ? '#2563eb' : '#64748b',
              borderColor:     filtre === val ? '#bfdbfe' : '#e2e8f0',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{colLabel}</th>
                <th style={s.th}>Statut</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun élément trouvé</td></tr>
              ) : filtered.map(it => (
                <tr key={it.id}>
                  <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>
                    {it[champAffichage]}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      ...(it.actif ? s.badgeActif : s.badgeInactif),
                    }}>
                      {it.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <div style={s.btnRow}>
                      <button style={{ ...s.btnAction, ...s.btnToggle }} onClick={() => toggleStatut(it)}>
                        {it.actif ? 'Désactiver' : 'Activer'}
                      </button>
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
                {editItem ? `Modifier — ${labelModal}` : labelModal}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalForm}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  {labelChamp}
                </label>
                <input
                  style={{ ...s.input, width: '100%', boxSizing: 'border-box' }}
                  value={formVal}
                  onChange={e => setFormVal(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnAction} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btnAction, ...s.btnBlue }}>
                  {editItem ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}