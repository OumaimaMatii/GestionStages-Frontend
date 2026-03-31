import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res      = await authService.login(email, password);
      const userData = res.data;
      login(userData, userData.token);
      userData.roles?.includes('Gestionnaire')
        ? navigate('/utilisateurs', { replace: true })
        : navigate('/stages',       { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '22px', color: '#1e293b', fontWeight: 700 }}>Connexion</h2>
        <p style={{ marginBottom: '28px', fontSize: '13px', color: '#6b7280' }}>Gestion des Stages</p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600, backgroundColor: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        {/* //gestionnaire@gestion.com
        //Gestion2024 */}
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Pas de compte ?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
