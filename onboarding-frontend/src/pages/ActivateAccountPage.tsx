import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { activateAccountApi, getTokenInfoApi } from "../api/authApi";

const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch token info (email, name) when the page loads
  const { data: tokenInfo, isLoading, isError } = useQuery({
    queryKey: ["tokenInfo", token],
    queryFn: () => getTokenInfoApi(token),
    enabled: !!token, // only run if token exists
    retry: false,
  });

  const activateMutation = useMutation({
    mutationFn: activateAccountApi,
    onSuccess: (message) => {
      setSuccessMessage(message);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (error: any) => {
      setErrorMessage(
        error.response?.data?.error || "Une erreur est survenue."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    activateMutation.mutate({ token, password, confirmPassword });
  };

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lien invalide. Aucun token trouvé.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Vérification du lien...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center">
          <p className="font-semibold">Lien invalide ou expiré.</p>
          <p className="text-sm mt-1">Contactez votre service RH.</p>
        </div>
      </div>
    );
  }

  // ─── Main Form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Activer votre compte
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Bienvenue, {tokenInfo?.prenom} {tokenInfo?.nom}
        </p>

        {/* Display info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email :</span>
            <span className="font-medium text-gray-800">{tokenInfo?.email}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">Rôle :</span>
            <span className="font-medium text-blue-600">{tokenInfo?.role}</span>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {successMessage} Redirection en cours...
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Répétez le mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={activateMutation.isPending || !!successMessage}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {activateMutation.isPending
              ? "Activation en cours..."
              : "Activer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivateAccountPage;