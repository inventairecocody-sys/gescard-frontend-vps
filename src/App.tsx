import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Inventaire from "./pages/Inventaire";
import ImportExport from "./pages/ImportExport";
import Journal from "./pages/Journal";
import Profil from "./pages/Profil";
import GestionComptes from "./pages/GestionComptes"; // ✅ AJOUTER CET IMPORT

// ✅ Composant pour protéger les routes selon le rôle
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "";

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(allowedRole => 
      role.toLowerCase().includes(allowedRole.toLowerCase())
    );
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500">
              Rôle actuel: <span className="font-semibold">{role}</span>
            </p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] transition-colors"
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

const App: React.FC = () => {
  return (
    <Router>
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

        {/* Import/Export - accessible à Administrateur, Superviseur, Chef d'équipe */}
        <Route
          path="/import-export"
          element={
            <ProtectedRoute allowedRoles={["Administrateur", "Superviseur", "Chef d'équipe", "Chef d'equipe"]}>
              <ImportExport />
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

        {/* ✅ Gestion des Comptes - accessible seulement à Administrateur */}
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

        {/* Redirection par défaut */}
        <Route 
          path="*" 
          element={
            localStorage.getItem("token") ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;