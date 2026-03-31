import { useState, useEffect, useRef } from 'react';
import utilisateurService from '../../services/utilisateurService';
import serviceService     from '../../services/serviceService';
import api                from '../../api/axios';
import s                  from '../../styles/tableStyles';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alert,        setAlert]        = useState({ type: '', msg: '' });
  const [filtreStatut, setFiltreStatut] = useState('tous');

  // ── Modal Ajouter ──────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '', password: '', confirmPassword: '',
    nomComplet: '', serviceId: '', role: 'Collaborateur', isVerified: false,
  });

  // ── Modal Modifier ─────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', nomComplet: '', role: 'Collaborateur', serviceId: '' });

  // ── Modal Vérifier ─────────────────────────────────────
  const [showVerif,  setShowVerif]  = useState(false);
  const [verifUser,  setVerifUser]  = useState(null);
  const [verifRole,  setVerifRole]  = useState('Collaborateur');

  // ── Import Excel ───────────────────────────────────────
  const inputRef              = useRef(null);
  const [loadExcel, setLoadExcel] = useState(false);

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [u, sv] = await Promise.all([utilisateurService.getAll(), serviceService.getAll()]);
      setUtilisateurs(u.data);
      setServices(sv.data);
    } catch { flash('danger', 'Erreur de chargement.'); }
    finally { setLoading(false); }
  };

  // ── Filtrage ───────────────────────────────────────────
  const filtered = utilisateurs.filter(u => {
    if (filtreStatut === 'verifies')     return u.isVerified;
    if (filtreStatut === 'non-verifies') return !u.isVerified;
    return true;
  });

  // ── Créer ──────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword)
      return flash('danger', 'Mots de passe non identiques.');
    try {
      await utilisateurService.create(
        addForm.email, addForm.password, addForm.nomComplet,
        addForm.serviceId || null, addForm.role, addForm.isVerified
      );
      flash('success', 'Utilisateur créé.');
      setShowAdd(false); load();
    } catch (err) { flash('danger', err.response?.data?.message || 'Erreur.'); }
  };

  // ── Modifier ───────────────────────────────────────────
  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      email:     u.email,
      nomComplet: u.nomComplet,
      role:      u.roles?.[0] || 'Collaborateur',
      serviceId: u.serviceId || '',
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await utilisateurService.modifier(
        editUser.id, editForm.nomComplet, editForm.role,
        editForm.serviceId || null, editForm.email
      );
      flash('success', 'Utilisateur mis à jour.');
      setShowEdit(false); load();
    } catch (err) { flash('danger', err.response?.data?.message || 'Erreur.'); }
  };

  // ── Vérifier + assigner rôle ───────────────────────────
  const openVerif = (u) => {
    setVerifUser(u);
    setVerifRole(u.roles?.[0] || 'Collaborateur');
    setShowVerif(true);
  };

  const handleVerifier = async (e) => {
    e.preventDefault();
    try {
      await utilisateurService.verifierEtRole(verifUser.id, verifRole);
      flash('success', `${verifUser.nomComplet} vérifié en tant que ${verifRole}.`);
      setShowVerif(false); load();
    } catch (err) { flash('danger', err.response?.data?.message || 'Erreur.'); }
  };

  // ── Supprimer ──────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try { await utilisateurService.delete(id); flash('success', 'Supprimé.'); load(); }
    catch { flash('danger', 'Erreur.'); }
  };

  // ── Import Excel ───────────────────────────────────────
  const handleFichierExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const fd = new FormData();
    fd.append('file', file);
    setLoadExcel(true);
    try {
      const res = await api.post('/import/utilisateurs', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { succes = [], erreurs = [] } = res.data;
      flash('success', `${succes.length} créé(s), ${erreurs.length} ignoré(s).`);
      load();
    } catch (err) {
      flash('danger', err.response?.data?.message || "Erreur import.");
    } finally {
      setLoadExcel(false);
    }
  };

  // ── Input style local (compatible avec s) ─────────────
  const inputLocal = {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
    outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box',
  };
  const selectLocal = { ...inputLocal, backgroundColor: '#fff' };
  const labelStyle  = { fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' };

  return (
    <div style={s.container}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Utilisateurs</h1>
          <p style={s.subtitle}>Gestion des accès et des rôles</p>
        </div>
        <div style={s.headerBtns}>
          {/* Input Excel caché */}
          <input
            type="file" accept=".xlsx" ref={inputRef}
            onChange={handleFichierExcel} style={{ display: 'none' }}
          />
          <button
            style={{ ...s.btnGreen, opacity: loadExcel ? 0.7 : 1 }}
            onClick={() => inputRef.current.click()}
            disabled={loadExcel}
          >
            {loadExcel ? 'Import...' : '⬆ Importer Excel'}
          </button>
          <button style={s.btnBlue} onClick={() => setShowAdd(true)}>
            + Nouvel utilisateur
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
          {[['tous', 'Tous'], ['verifies', 'Vérifiés'], ['non-verifies', 'En attente']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltreStatut(val)} style={{
              ...s.btnAction,
              backgroundColor: filtreStatut === val ? '#eff6ff' : '#fff',
              color:           filtreStatut === val ? '#2563eb' : '#64748b',
              borderColor:     filtreStatut === val ? '#bfdbfe' : '#e2e8f0',
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
                <th style={s.th}>Nom Complet</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Rôle</th>
                <th style={s.th}>Statut</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ ...s.td, fontWeight: '600', color: '#1e293b' }}>{u.nomComplet}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      backgroundColor: u.roles?.includes('Gestionnaire') ? '#eff6ff' : '#f8fafc',
                      color:           u.roles?.includes('Gestionnaire') ? '#2563eb' : '#475569',
                    }}>
                      {u.roles?.[0] || '—'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      backgroundColor: u.isVerified ? '#f0fdf4' : '#fffbeb',
                      color:           u.isVerified ? '#16a34a' : '#d97706',
                    }}>
                      {u.isVerified ? 'Vérifié' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {/* Bouton Vérifier — visible uniquement si non vérifié */}
                      {!u.isVerified && (
                        <button
                          onClick={() => openVerif(u)}
                          style={{
                            ...s.btnAction,
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            borderColor: '#bbf7d0',
                          }}
                        >
                          ✓ Vérifier
                        </button>
                      )}
                      <button style={s.btnAction} onClick={() => openEdit(u)}>Modifier</button>
                      <button style={{ ...s.btnAction, ...s.btnDelete }} onClick={() => handleDelete(u.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ Modal Ajouter ══════════════════════════════════ */}
      {showAdd && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Ajouter un compte</h3>
              <button onClick={() => setShowAdd(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleCreate} style={s.modalForm}>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Nom Complet *</label>
                <input style={inputLocal} value={addForm.nomComplet}
                  onChange={e => setAddForm({ ...addForm, nomComplet: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Email *</label>
                <input style={inputLocal} type="email" value={addForm.email}
                  onChange={e => setAddForm({ ...addForm, email: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={labelStyle}>Mot de passe *</label>
                  <input style={inputLocal} type="password" value={addForm.password}
                    onChange={e => setAddForm({ ...addForm, password: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Confirmer *</label>
                  <input style={inputLocal} type="password" value={addForm.confirmPassword}
                    onChange={e => setAddForm({ ...addForm, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Rôle *</label>
                <select style={selectLocal} value={addForm.role}
                  onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                  <option value="Collaborateur">Collaborateur</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                </select>
              </div>
              {addForm.role === 'Collaborateur' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>Service</label>
                  <select style={selectLocal} value={addForm.serviceId}
                    onChange={e => setAddForm({ ...addForm, serviceId: e.target.value })}>
                    <option value="">-- Choisir un service --</option>
                    {services.map(sv => <option key={sv.id} value={sv.id}>{sv.nom}</option>)}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addForm.isVerified}
                    onChange={e => setAddForm({ ...addForm, isVerified: e.target.checked })} />
                  Compte vérifié immédiatement
                </label>
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnAction} onClick={() => setShowAdd(false)}>Annuler</button>
                <button type="submit" style={s.btnBlue}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal Modifier ═════════════════════════════════ */}
      {showEdit && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Modifier l'utilisateur</h3>
              <button onClick={() => setShowEdit(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleUpdate} style={s.modalForm}>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Nom Complet *</label>
                <input style={inputLocal} value={editForm.nomComplet}
                  onChange={e => setEditForm({ ...editForm, nomComplet: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Email *</label>
                <input style={inputLocal} type="email" value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Rôle *</label>
                <select style={selectLocal} value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="Collaborateur">Collaborateur</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                </select>
              </div>
              {editForm.role === 'Collaborateur' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>Service</label>
                  <select style={selectLocal} value={editForm.serviceId}
                    onChange={e => setEditForm({ ...editForm, serviceId: e.target.value })}>
                    <option value="">-- Choisir un service --</option>
                    {services.map(sv => <option key={sv.id} value={sv.id}>{sv.nom}</option>)}
                  </select>
                </div>
              )}
              <div style={s.modalFooter}>
                <button type="button" style={s.btnAction} onClick={() => setShowEdit(false)}>Annuler</button>
                <button type="submit" style={s.btnBlue}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal Vérifier ═════════════════════════════════ */}
      {showVerif && verifUser && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                Vérifier — {verifUser.nomComplet}
              </h3>
              <button onClick={() => setShowVerif(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleVerifier} style={s.modalForm}>

              {/* Info utilisateur */}
              <div style={{
                backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{verifUser.email}</div>
              </div>

              {/* Choix du rôle */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Assigner un rôle *</label>
                <select
                  style={selectLocal}
                  value={verifRole}
                  onChange={e => setVerifRole(e.target.value)}
                >
                  <option value="Collaborateur">Collaborateur</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                </select>
              </div>

              <div style={s.modalFooter}>
                <button type="button" style={s.btnAction} onClick={() => setShowVerif(false)}>Annuler</button>
                <button type="submit" style={{
                  ...s.btnBlue,
                  backgroundColor: '#16a34a',
                }}>
                  ✓ Confirmer la vérification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}