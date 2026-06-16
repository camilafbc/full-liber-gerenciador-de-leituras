"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserData {
  uuid: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface SessionData {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  setUser: (user: UserData | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<SessionData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (token && user) {
        setLoading(false);
        return;
      }

      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const currentToken = refreshData.accessToken || refreshData;

          setToken(currentToken);

          const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });

          if (me.ok) {
            const data = await me.json();
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Erro ao reidratar sessão:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setToken, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }
  return context;
}
