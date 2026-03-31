import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService    from '../../services/authService';
import serviceService from '../../services/serviceService';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', nomComplet: '', serviceId: '' });
  const [services, setServices] = useState([]);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    serviceService.getAll().then(res => setServices(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validatePassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    if (!validatePassword(form.password)) { setError('Min 8 caractères, 1 majuscule, 1 chiffre.'); return; }
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await authService.register(form.email, form.password, form.nomComplet, form.serviceId || null);
      setSuccess('Compte créé ! En attente de vérification.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '22px', color: '#1e293b', fontWeight: 700 }}>Créer un compte</h2>
        <p style={{ marginBottom: '28px', fontSize: '13px', color: '#6b7280' }}>Rejoignez la plateforme de gestion des stages</p>

        {error   && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Nom complet</label>
            <input type="text" name="nomComplet" value={form.nomComplet} onChange={handleChange} required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Confirmation</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Service</label>
            <select name="serviceId" value={form.serviceId} onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="">-- Choisir un service --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading || !!success}
            style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600, backgroundColor: (loading || success) ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: (loading || success) ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Déjà inscrit ?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}