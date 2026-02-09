import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../services/auth.service";
import { loginRequest, registerRequest } from "../services/auth.service";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const storageKey = "excedentes_auth";

const readStoredAuth = (): { token: string | null; user: AuthUser | null } => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { token: null, user: null };
    }

    return JSON.parse(raw) as { token: string; user: AuthUser };
  } catch {
    return { token: null, user: null };
  }
};

const persistAuth = (token: string | null, user: AuthUser | null) => {
  if (!token || !user) {
    localStorage.removeItem(storageKey);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify({ token, user }));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    setToken(stored.token);
    setUser(stored.user);
    setIsLoading(false);
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const result = await loginRequest(payload);
    setToken(result.token);
    setUser(result.user);
    persistAuth(result.token, result.user);
  };

  const register = async (payload: {
    name?: string;
    email: string;
    password: string;
  }) => {
    const result = await registerRequest(payload);
    setToken(result.token);
    setUser(result.user);
    persistAuth(result.token, result.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    persistAuth(null, null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading,
      user,
      login,
      register,
      logout,
    }),
    [token, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
