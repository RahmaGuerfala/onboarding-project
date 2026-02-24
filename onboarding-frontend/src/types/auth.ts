// Ajouter MANAGER aux types
export type UserRole = "SALARIE" | "MANAGER" | "ADMIN";
export type StatutCompte = "EN_ATTENTE" | "VALIDE" |"ACCEPTE"| "REFUSE" |"EXPIRE"| "DESACTIVE";  // ← ajouter

export interface User {           // ← ajouter
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  statutCompte: StatutCompte;
  profilCompletion: number;
  dateCreation: string;
  dateValidation?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: UserRole;  // ← typé précisément
  userId: string;
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TokenInfo {
  email: string;
  role: UserRole;  // ← typé précisément
  prenom: string;
  nom: string;
}

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;  // ← SALARIE ou MANAGER (pas ADMIN)
}
