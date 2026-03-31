import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import logo from '../assets/logo-mef.jpg';

const menuGestionnaire = [
  { label: 'Utilisateurs',   path: '/utilisateurs' },
  { label: 'Services',       path: '/referentiels/services' },
  { label: 'Etablissements', path: '/referentiels/etablissements' },
  { label: 'Filieres',       path: '/referentiels/filieres' },
  { label: 'Niveaux',        path: '/referentiels/niveaux' },
  { label: 'Nature Stages',  path: '/referentiels/naturestages' },
  { label: 'Durees',         path: '/referentiels/durees' },
];

const menuCollaborateur = [
  { label: 'Themes',            path: '/themes' },
  { label: 'Sujets',            path: '/sujets' },
  { label: 'Stages',            path: '/stages' },
  { label: 'Stagiaires',        path: '/stagiaires' },
  { label: 'Calendrier',        path: '/calendrier' },
  { label: 'Stages de service', path: '/service-stages' },
  { label: 'Statistiques',      path: '/statistiques' },
];

export default function Navbar() {
  const { user, logout, isGestionnaire } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/login');
  };

  const menu = isGestionnaire() ? menuGestionnaire : menuCollaborateur;

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>

      {/* ── Barre supérieure ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '56px', borderBottom: '1px solid #f3f4f6',
      }}>

        {/* Logo + Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={logo}
            alt="Logo MEF"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: '6px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af', letterSpacing: '0.3px' }}>
              Gestion des Stages
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Plateforme de suivi
            </span>
          </div>
        </div>

        {/* Infos utilisateur + Déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{user?.nomComplet}</span>
          <span style={{
            fontSize: '11px', backgroundColor: '#eff6ff', color: '#2563eb',
            border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '3px', fontWeight: 500,
          }}>
            {isGestionnaire() ? 'Gestionnaire' : 'Collaborateur'}
          </span>
          <button onClick={handleLogout} style={{
            fontSize: '12px', padding: '5px 12px', backgroundColor: '#f8fafc',
            color: '#374151', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer',
          }}>
            Déconnexion
          </button>
        </div>

      </div>

      {/* ── Menu horizontal ── */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 32px',
        height: '42px', gap: '4px', overflowX: 'auto',
      }}>
        {menu.map((item) => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            padding: '6px 14px', fontSize: '13px', textDecoration: 'none',
            borderRadius: '4px', fontWeight: isActive ? 600 : 400,
            color:           isActive ? '#1d4ed8' : '#4b5563',
            backgroundColor: isActive ? '#eff6ff'  : 'transparent',
            borderBottom:    isActive ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          })}>
            {item.label}
          </NavLink>
        ))}
      </div>

    </nav>
  );
}