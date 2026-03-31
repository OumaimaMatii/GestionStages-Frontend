// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login             from './pages/auth/Login';
import Register          from './pages/auth/Register';
import Utilisateurs      from './pages/utilisateurs/Utilisateurs';
import Services          from './pages/referentiels/Services';
import Etablissements    from './pages/referentiels/Etablissements';
import Filieres          from './pages/referentiels/Filieres';
import Niveaux           from './pages/referentiels/Niveaux';
import NatureStages      from './pages/referentiels/NatureStages';
import Durees            from './pages/referentiels/Durees';
import Themes            from './pages/themes/Themes';
import Sujets            from './pages/sujets/Sujets';
import Stages            from './pages/stages/Stages';
import AjouterStage      from './pages/stages/AjouterStage';
import Stagiaires        from './pages/stagiaires/Stagiaires';
import Calendrier from './pages/Calendrier/Calendrier';
import StatistiquesCompletes from './pages/Statistiques/Statistiques';
import Rencontres        from './pages/rencontres/Rencontres';
import NouvelleRencontre from './pages/rencontres/NouvelleRencontre';
import DetailRencontre   from './pages/rencontres/DetailRencontre';
import ServiceStages from './pages/stages/ServiceStages';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles?.includes('Gestionnaire')
    ? <Navigate to="/utilisateurs" replace />
    : <Navigate to="/stages"       replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Collaborateur */}
      <Route path="/themes"         element={<ProtectedRoute><Themes /></ProtectedRoute>} />
      <Route path="/sujets"         element={<ProtectedRoute><Sujets /></ProtectedRoute>} />
      <Route path="/service-stages"         element={<ProtectedRoute><ServiceStages /></ProtectedRoute>} />
      <Route path="/stages"         element={<ProtectedRoute><Stages /></ProtectedRoute>} />
      <Route path="/stages/ajouter" element={<ProtectedRoute><AjouterStage /></ProtectedRoute>} />
      <Route path="/stagiaires"     element={<ProtectedRoute><Stagiaires /></ProtectedRoute>} />
      <Route path="/calendrier"     element={<ProtectedRoute><Calendrier /></ProtectedRoute>} />
      <Route path="/statistiques"   element={<ProtectedRoute><StatistiquesCompletes /></ProtectedRoute>} />

      {/* Rencontres */}
      <Route path="/stages/:stageId/rencontres"              element={<ProtectedRoute><Rencontres /></ProtectedRoute>} />
      <Route path="/stages/:stageId/rencontres/nouvelle"     element={<ProtectedRoute><NouvelleRencontre /></ProtectedRoute>} />
      <Route path="/stages/:stageId/rencontres/:rencontreId" element={<ProtectedRoute><DetailRencontre /></ProtectedRoute>} />

      {/* Gestionnaire */}
      <Route path="/utilisateurs"                element={<ProtectedRoute role="Gestionnaire"><Utilisateurs /></ProtectedRoute>} />
      <Route path="/referentiels/services"       element={<ProtectedRoute role="Gestionnaire"><Services /></ProtectedRoute>} />
      <Route path="/referentiels/etablissements" element={<ProtectedRoute role="Gestionnaire"><Etablissements /></ProtectedRoute>} />
      <Route path="/referentiels/filieres"       element={<ProtectedRoute role="Gestionnaire"><Filieres /></ProtectedRoute>} />
      <Route path="/referentiels/niveaux"        element={<ProtectedRoute role="Gestionnaire"><Niveaux /></ProtectedRoute>} />
      <Route path="/referentiels/naturestages"   element={<ProtectedRoute role="Gestionnaire"><NatureStages /></ProtectedRoute>} />
      <Route path="/referentiels/durees"         element={<ProtectedRoute role="Gestionnaire"><Durees /></ProtectedRoute>} />

      <Route path="/"  element={<RootRedirect />} />
      <Route path="*"  element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}