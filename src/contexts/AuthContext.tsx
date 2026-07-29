import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = "calculadora_v2_user";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window === "undefined" ? null : readStoredUser(),
  );

  const login = useCallback((email: string, password: string) => {
    const trimmed = email.trim();
    if (!trimmed || !password.trim()) return false;
    const next: AuthUser = {
      email: trimmed,
      name: trimmed.split("@")[0]?.replace(/\./g, " ") ?? "Usuário",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
