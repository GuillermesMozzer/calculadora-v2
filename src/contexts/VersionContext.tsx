import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppVersion = "v1" | "v2";

const STORAGE_KEY = "calculadora_app_version";

interface VersionContextValue {
  version: AppVersion;
  setVersion: (version: AppVersion) => void;
}

const VersionContext = createContext<VersionContextValue | null>(null);

function readStoredVersion(): AppVersion {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "v1" ? "v1" : "v2";
  } catch {
    return "v2";
  }
}

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<AppVersion>(() =>
    typeof window === "undefined" ? "v2" : readStoredVersion(),
  );

  const setVersion = useCallback((next: AppVersion) => {
    localStorage.setItem(STORAGE_KEY, next);
    setVersionState(next);
  }, []);

  const value = useMemo(() => ({ version, setVersion }), [version, setVersion]);

  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>;
}

export function useVersion() {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error("useVersion must be used within VersionProvider");
  return ctx;
}
