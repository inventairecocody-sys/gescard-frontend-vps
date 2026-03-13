// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth }      from "./hooks/useAuth";
import { AuthProvider } from "./providers/AuthProvider";
import Navbar           from "./components/Navbar";

// Pages
import Login            from "./pages/Login";
import Accueil          from "./pages/Accueil";
import TableauDeBord    from "./pages/TableauDeBord";
import Recherche        from "./pages/Recherche";
import Journal          from "./pages/Journal";
import Profil           from "./pages/Profil";
import Comptes          from "./pages/administration/Comptes";
import MisesAjour       from "./pages/administration/MisesAjour";

// ============================================================
// ROUTE PROTÉGÉE
// ============================================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user?.role || '');
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center max-w-md border border-orange-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#F77F00]">Rôle actuel :</span> {user?.role}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] transition-all duration-300 font-medium shadow-lg"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// ============================================================
// CONTENU PRINCIPAL
// ============================================================
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {isAuthenticated && !hideNavbar && <Navbar />}

      <Routes>
        {/* ── Publique ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<Navigate to="/login" replace />} />

        {/* ── Tous les connectés ── */}
        <Route path="/accueil" element={
          <ProtectedRoute><Accueil /></ProtectedRoute>
        } />

        <Route path="/profil" element={
          <ProtectedRoute><Profil /></ProtectedRoute>
        } />

        <Route path="/recherche" element={
          <ProtectedRoute><Recherche /></ProtectedRoute>
        } />

        {/* ── Administrateur + Gestionnaire ── */}
        <Route path="/tableau-de-bord" element={
          <ProtectedRoute allowedRoles={['Administrateur', 'Gestionnaire']}>
            <TableauDeBord />
          </ProtectedRoute>
        } />

        {/* ── Administrateur uniquement ── */}
        <Route path="/journal" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Journal />
          </ProtectedRoute>
        } />

        {/* ── Administration : Comptes ── */}
        <Route path="/administration/comptes" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Comptes />
          </ProtectedRoute>
        } />

        {/* ── Administration : Mises à jour ── */}
        <Route path="/administration/mises-a-jour" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <MisesAjour />
          </ProtectedRoute>
        } />

        {/* ── Redirection /administration → premier sous-menu accessible ── */}
        <Route path="/administration" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Navigate to="/administration/comptes" replace />
          </ProtectedRoute>
        } />

        {/* ── Anciennes routes → redirect pour compatibilité ── */}
        <Route path="/home"            element={<Navigate to="/accueil"                  replace />} />
        <Route path="/inventaire"      element={<Navigate to="/recherche"                replace />} />
        <Route path="/dashboard"       element={<Navigate to="/tableau-de-bord"          replace />} />
        <Route path="/gestion-comptes" element={<Navigate to="/administration/comptes"   replace />} />

        {/* ── 404 ── */}
        <Route path="*" element={
          isAuthenticated
            ? <Navigate to="/accueil" replace />
            : <Navigate to="/login"   replace />
        } />
      </Routes>
    </>
  );
};

// ============================================================
// APP
// ============================================================
const App: React.FC = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;