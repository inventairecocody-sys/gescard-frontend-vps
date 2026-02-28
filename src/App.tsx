import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";  // ✅ IMPORT AJOUTÉ
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Inventaire from "./pages/Inventaire";
import Journal from "./pages/Journal";
import Profil from "./pages/Profil";
import GestionComptes from "./pages/GestionComptes";

// Type pour les props du ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Composant pour protéger les routes selon le rôle
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || '';
    const hasAccess = allowedRoles.some(allowedRole => 
      userRole === allowedRole
    );
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center max-w-md border border-orange-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#F77F00]">Rôle actuel :</span> {userRole}
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

// Composant principal avec le provider
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* ✅ NAVBAR AFFICHÉE UNIQUEMENT SI CONNECTÉ */}
      {isAuthenticated && <Navbar />}
      
      <Routes>
        {/* Page de connexion - publique */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Page d'accueil - accessible à tous les connectés */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Dashboard - accessible à tous les connectés */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Inventaire - accessible à tous les connectés */}
        <Route
          path="/inventaire"
          element={
            <ProtectedRoute>
              <Inventaire />
            </ProtectedRoute>
          }
        />

        {/* Journal - accessible seulement à Administrateur */}
        <Route
          path="/journal"
          element={
            <ProtectedRoute allowedRoles={["Administrateur"]}>
              <Journal />
            </ProtectedRoute>
          }
        />

        {/* Gestion des Comptes - accessible seulement à Administrateur */}
        <Route
          path="/gestion-comptes"
          element={
            <ProtectedRoute allowedRoles={["Administrateur"]}>
              <GestionComptes />
            </ProtectedRoute>
          }
        />

        {/* Profil - accessible à tous les connectés */}
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />

        {/* ✅ REDIRECTION VERS HOME (pas dashboard) */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/home" replace /> :  // ← CORRIGÉ: dashboard → home
            <Navigate to="/" replace />
          } 
        />
      </Routes>
    </>
  );
};

// App principal avec le provider
const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;