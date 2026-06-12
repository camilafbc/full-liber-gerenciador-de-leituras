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
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setToken(refreshData);

          const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await me.json();
          setUser(data.user);

          // const meResponse = await fetch("/api/auth/me");

          // if (meResponse.ok) {
          //   const data = await meResponse.json();
          //   setUser(data.user);
          // }
        }
      } catch (error) {
        console.error("Erro ao setar sessão:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
