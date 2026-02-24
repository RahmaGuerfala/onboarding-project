import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createEmployeeApi, getAllUsersApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { type UserRole, type User } from "../types/auth";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout, email } = useAuth();
  const queryClient = useQueryClient();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [role, setRole] = useState<UserRole>("SALARIE");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsersApi,
  });

  const createMutation = useMutation({
    mutationFn: createEmployeeApi,
    onSuccess: (message: string) => {
      setSuccessMessage(message);
      setErrorMessage("");
      setNom("");
      setPrenom("");
      setEmployeeEmail("");
      setRole("SALARIE");
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.error || "Une erreur est survenue.");
      setSuccessMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    createMutation.mutate({ nom, prenom, email: employeeEmail, role });
  };

  const statutColor: Record<string, string> = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-700",
    ACCEPTE: "bg-green-100 text-green-700",
    EXPIRE: "bg-red-100 text-red-700",
    DESACTIVE: "bg-gray-100 text-gray-500",
    VALIDE: "bg-green-100 text-green-700",
  };

  const roleColor: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-purple-100 text-purple-700",
    SALARIE: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Onboarding — Espace RH</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{email}</span>
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
            ADMIN
          </span>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-10 px-4 space-y-8 pb-16">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Total comptes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{users?.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {users?.filter((u: User) => u.statutCompte === "EN_ATTENTE").length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Comptes actifs</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {users?.filter((u: User) => u.statutCompte === "ACCEPTE").length ?? 0}
            </p>
          </div>
        </div>

        {/* Formulaire création */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Créer un nouveau compte</h2>
          <p className="text-sm text-gray-400 mb-6">
            Un email d'activation sera automatiquement envoyé à l'employé.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  placeholder="Dupont"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  placeholder="Jean"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email personnel (depuis le CV)
              </label>
              <input
                type="email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                required
                placeholder="employe@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="SALARIE">Salarié</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                ✅ {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ❌ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {createMutation.isPending
                ? "Création en cours..."
                : "Créer le compte et envoyer l'invitation"}
            </button>
          </form>
        </div>

        {/* Tableau employés */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tous les comptes</h2>

          {isLoading ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : !users || users.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun compte créé pour l'instant.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nom</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rôle</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 font-medium text-gray-800">
                        {user.prenom} {user.nom}
                      </td>
                      <td className="py-3 text-gray-500">{user.email}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statutColor[user.statutCompte]}`}>
                          {user.statutCompte}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {user.dateCreation
                          ? new Date(user.dateCreation).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboardPage;