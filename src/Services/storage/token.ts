const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface StoredUser {
  id: number;
  nomUtilisateur: string;
  role: string;
  coordination: string;
  agence: string;
}

export const TokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): StoredUser | null {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  }
};