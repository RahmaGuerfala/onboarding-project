import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrentUserApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout, email, role, isAdmin, isManager } = useAuth();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserApi,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Badge couleur selon le rôle
  const roleBadgeColor = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-purple-100 text-purple-700",
    SALARIE: "bg-blue-100 text-blue-700",
  }[role ?? "SALARIE"];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Onboarding App</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{email}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadgeColor}`}>
            {role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-10 px-4 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Tableau de bord</h2>

        {isLoading ? (
          <div className="text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* Infos communes à tous */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Mon compte
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nom :</span>
                  <span className="ml-2 font-medium">
                    {user?.prenom} {user?.nom}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email :</span>
                  <span className="ml-2 font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rôle :</span>
                  <span className={`ml-2 font-medium`}>{user?.role}</span>
                </div>
                <div>
                  <span className="text-gray-500">Statut :</span>
                  <span className="ml-2 font-medium text-green-600">
                    {user?.statutCompte}
                  </span>
                </div>
              </div>
            </div>

            {/* Section visible par ADMIN (RH) uniquement */}
            {isAdmin && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Administration RH
                </h3>
                <p className="text-sm text-red-600">
                  Vous avez accès à la gestion des comptes, des parcours et des affectations.
                </p>
                {/* Boutons futurs : créer employé, voir tous les users, etc. */}
              </div>
            )}

            {/* Section visible par MANAGER et ADMIN */}
            {(isManager || isAdmin) && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">
                  Espace Manager
                </h3>
                <p className="text-sm text-purple-600">
                  Vous pouvez suivre les parcours et tâches de vos salariés.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;