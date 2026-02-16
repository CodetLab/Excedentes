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
  token: string | null;
  companyId: string | null;
  role: "admin" | "company" | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name?: string;
    email: string;
    password: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const storageKey = "excedentes_auth";

const readStoredAuth = (): { 
  token: string | null; 
  user: AuthUser | null;
  companyId: string | null;
  role: "admin" | "company" | null;
} => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { token: null, user: null, companyId: null, role: null };
    }

    const parsed = JSON.parse(raw) as { 
      token: string; 
      user: AuthUser;
      companyId?: string;
      role?: "admin" | "company";
    };
    
    return { 
      token: parsed.token, 
      user: parsed.user,
      companyId: parsed.companyId || null,
      role: parsed.role || null
    };
  } catch {
    return { token: null, user: null, companyId: null, role: null };
  }
};

const persistAuth = (
  token: string | null, 
  user: AuthUser | null,
  companyId: string | null = null,
  role: "admin" | "company" | null = null
) => {
  if (!token || !user) {
    localStorage.removeItem(storageKey);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify({ token, user, companyId, role }));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "company" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    setToken(stored.token);
    setUser(stored.user);
    setCompanyId(stored.companyId);
    setRole(stored.role);
    setIsLoading(false);
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const result = await loginRequest(payload);
    setToken(result.token);
    setUser(result.user);
    setCompanyId(result.user.companyId || null);
    setRole(result.user.role as "admin" | "company" || "company");
    persistAuth(result.token, result.user, result.user.companyId, result.user.role as "admin" | "company" | null);
  };

  const register = async (payload: {
    name?: string;
    email: string;
    password: string;
    companyName?: string;
  }) => {
    const result = await registerRequest(payload);
    setToken(result.token);
    setUser(result.user);
    setCompanyId(result.user.companyId || null);
    setRole(result.user.role as "admin" | "company" || "company");
    persistAuth(result.token, result.user, result.user.companyId, result.user.role as "admin" | "company" | null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompanyId(null);
    setRole(null);
    persistAuth(null, null, null, null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading,
      user,
      token,
      companyId,
      role,
      login,
      register,
      logout,
    }),
    [token, isLoading, user, companyId, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
