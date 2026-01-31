export interface UserType {
  id: number;
  nomUtilisateur: string;
  nomComplet: string;
  email?: string;
  agence?: string;
  role: string;
  dateCreation: string;
  actif: boolean;
}

export interface UserFormData {
  nomUtilisateur: string;
  nomComplet: string;
  email: string;
  agence: string;
  role: string;
  motDePasse: string;
  confirmerMotDePasse: string;
}